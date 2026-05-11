import { GoogleGenAI, Type } from "@google/genai";
import { DiaryEntry, OverallAnalysis, ScoreArea } from '../types';
import { AIProviderService } from './aiProvider';

const scoreAreaOptions: ScoreArea[] = ['Productivity', 'Learning', 'Discovery', 'Entertainment'];

const diaryEntrySchema = {
  type: Type.OBJECT,
  properties: {
    isoDate: {
        type: Type.STRING,
        description: "The date of the analyzed history in ISO 8601 format (YYYY-MM-DD)."
    },
    date: {
      type: Type.STRING,
      description: "The date of the analyzed history data. Format it based on the requested language's locale. For example: 'July 25, 2024, Thursday' for English, or '25 Temmuz 2024, Perşembe' for Turkish. This should correspond to the isoDate."
    },
    title: {
      type: Type.STRING,
      description: "An engaging and creative title summarizing the day. For example, 'A Day of Code, News, and Discovery'."
    },
    summary: {
      type: Type.OBJECT,
      description: "A narrative summary dividing the day into time segments (morning, noon, evening). Use a friendly tone.",
      properties: {
        sabah: { type: Type.STRING, description: "Summary of morning activities." },
        oglen: { type: Type.STRING, description: "Summary of noon activities." },
        aksam: { type: Type.STRING, description: "Summary of evening activities." }
      },
      required: ["sabah", "oglen", "aksam"]
    },
    highlights: {
      type: Type.ARRAY,
      description: "List the 3-4 most important activities of the day along with an icon name.",
      items: {
        type: Type.OBJECT,
        properties: {
          activity: { type: Type.STRING, description: "A short description of the highlighted activity." },
          icon: {
            type: Type.STRING,
            description: "The icon name that best represents the activity. Options: 'code', 'news', 'shop', 'learn', 'entertainment', 'social', 'research', 'other'."
          }
        },
        required: ["activity", "icon"]
      }
    },
    categories: {
      type: Type.ARRAY,
      description: "A list of activity categories based on URLs and the count of activities in each.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "The category of the activity (e.g., 'Software Development', 'News', 'Social Media', 'Education', 'Shopping')."
          },
          activities: {
            type: Type.INTEGER,
            description: "The number of relevant URL visits in this category."
          }
        },
        required: ["category", "activities"]
      }
    },
    scores: {
        type: Type.ARRAY,
        description: "Scoring out of 5 and brief feedback for different areas based on the day's activities.",
        items: {
            type: Type.OBJECT,
            properties: {
                area: { type: Type.STRING, description: `The scoring area. Options must be one of: ${scoreAreaOptions.join(', ')}.`},
                score: { type: Type.INTEGER, description: "The score for the activity area out of 5."},
                feedback: { type: Type.STRING, description: "A short, motivating feedback based on the score."}
            },
            required: ["area", "score", "feedback"]
        }
    }
  },
  required: ["isoDate", "date", "title", "summary", "highlights", "categories", "scores"]
};

const responseSchema = {
    type: Type.ARRAY,
    items: diaryEntrySchema
};

const overallAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    persona: {
      type: Type.OBJECT,
      description: "A digital persona profile based on the user's overall digital habits.",
      properties: {
        title: { type: Type.STRING, description: "Persona title (e.g., 'Digital Explorer', 'Focused Developer')." },
        description: { type: Type.STRING, description: "A short, engaging description of the persona." },
        icon: { type: Type.STRING, description: "The icon that best represents the persona. Options: 'Discovery', 'Code', 'Learn', 'Social', 'Entertainment', 'Other'." },
      },
      required: ["title", "description", "icon"]
    },
    trends: {
      type: Type.ARRAY,
      description: "2-3 significant trends observed in the user's habits over time.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the trend (e.g., 'Increasing Focus on Learning')." },
          description: { type: Type.STRING, description: "A brief explanation of the trend." },
        },
        required: ["title", "description"]
      }
    },
    recommendations: {
      type: Type.ARRAY,
      description: "2-3 personalized, actionable recommendations to improve the user's digital well-being.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the recommendation (e.g., 'Balance Entertainment and Productivity')." },
          description: { type: Type.STRING, description: "A brief explanation of how to implement the recommendation." },
        },
        required: ["title", "description"]
      }
    }
  },
  required: ["persona", "trends", "recommendations"]
};

const parseJsonResponse = (jsonText: string) => {
  if (!jsonText) {
    throw new Error("Received an empty response from the API. Please try again.");
  }
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("The AI returned an unexpected format. Please check your input and try again.");
  }
};

const getPrompts = (lang: 'tr' | 'en') => {
    const targetLanguage = lang === 'tr' ? 'Turkish' : 'English';
    return {
        analyze: `
            Analyze the following browser history data and create a personal digital diary summary for the user.
            
            Instructions:
            1.  Carefully examine the data. If there are multiple days in the data, create a separate diary object for each day. Clearly distinguish the dates.
            2.  For each day:
                a. Determine the date and return it in two fields: 'isoDate' (format 'YYYY-MM-DD') and 'date' (localized format for ${targetLanguage}).
                b. Ignore repetitive and irrelevant entries (ads, redirects, CDNs, etc.).
                c. Group similar activities (e.g., multiple GitHub visits as 'Software Development', different news sites as 'News').
                d. Narrate the daily summary by dividing it into sections based on the timeline (morning, noon, evening).
                e. Identify the 3-4 most important activities of the day as 'highlights' and assign an appropriate icon name.
                f. Analyze the activities and score them out of 5 in the areas of 'Productivity', 'Learning', 'Discovery', and 'Entertainment', and write a short, constructive 'feedback' for each. The 'area' field must be one of these exact English words.
            3.  Return the response in the requested JSON format, in ${targetLanguage}. If there are multiple days, return an array of JSON objects.
        `,
        overall: `
            Below is a JSON array of the user's past digital diaries. Analyze this data to create a summary of the user's overall digital habits.

            Instructions:
            1.  **Determine a Digital Persona**: Based on the user's most dominant activities, create a creative digital persona profile (e.g., 'Digital Explorer', 'Focused Developer', 'Curious Learner'). Define this persona with a title, a short description, and an appropriate icon name.
            2.  **Identify Trends**: Compare activity data over time to identify 2-3 significant trends. For example, "Recent increase in software development activities" or "Weekend consumption of entertainment-focused content." Present each trend with a title and description.
            3.  **Provide Recommendations**: Based on the analysis, provide 2-3 personalized and actionable recommendations to improve the user's digital well-being or productivity. The recommendations should be positive and encouraging. Present each recommendation with a title and description.
            4.  Return the response in the requested JSON format, in ${targetLanguage}.
        `
    }
}

export class GeminiProvider implements AIProviderService {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async analyzeBrowsingHistory(history: string, lang: 'tr' | 'en'): Promise<DiaryEntry[]> {
    const prompt = `
    ${getPrompts(lang).analyze}
    
    Browser History Data:
    ---
    ${history}
    ---
  `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });

      const parsedData = parseJsonResponse(response.text.trim());

      if (!Array.isArray(parsedData)) {
        if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData as any]; 
        }
        throw new Error("Expected array format from API was not received.");
      }
      return parsedData;

    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error instanceof Error) throw error;
      throw new Error("A problem occurred while communicating with the AI.");
    }
  }

  async analyzeOverallHabits(entries: DiaryEntry[], lang: 'tr' | 'en'): Promise<OverallAnalysis> {
    const prompt = `
      ${getPrompts(lang).overall}

      Past Diary Data:
      ---
      ${JSON.stringify(entries, null, 2)}
      ---
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: overallAnalysisSchema,
          temperature: 0.8,
        },
      });
      
      return parseJsonResponse(response.text.trim());

    } catch (error) {
      console.error("Gemini API Error (Overall Analysis):", error);
      if (error instanceof Error) throw error;
      throw new Error("A problem occurred with the AI during the overall analysis.");
    }
  }
}
