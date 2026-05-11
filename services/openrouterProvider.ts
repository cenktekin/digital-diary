import { DiaryEntry, OverallAnalysis, ScoreArea } from '../types';
import { AIProviderService } from './aiProvider';

const scoreAreaOptions: ScoreArea[] = ['Productivity', 'Learning', 'Discovery', 'Entertainment'];

const diaryEntryJsonSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      isoDate: { type: "string", description: "The date in ISO 8601 format (YYYY-MM-DD)." },
      date: { type: "string", description: "Localized date string." },
      title: { type: "string", description: "Creative title summarizing the day." },
      summary: {
        type: "object",
        properties: {
          sabah: { type: "string", description: "Morning summary." },
          oglen: { type: "string", description: "Noon summary." },
          aksam: { type: "string", description: "Evening summary." }
        },
        required: ["sabah", "oglen", "aksam"]
      },
      highlights: {
        type: "array",
        items: {
          type: "object",
          properties: {
            activity: { type: "string" },
            icon: { type: "string", enum: ["code", "news", "shop", "learn", "entertainment", "social", "research", "other"] }
          },
          required: ["activity", "icon"]
        }
      },
      categories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            activities: { type: "integer" }
          },
          required: ["category", "activities"]
        }
      },
      scores: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string", enum: scoreAreaOptions },
            score: { type: "integer", description: "Score out of 5." },
            feedback: { type: "string" }
          },
          required: ["area", "score", "feedback"]
        }
      }
    },
    required: ["isoDate", "date", "title", "summary", "highlights", "categories", "scores"]
  }
};

const overallAnalysisJsonSchema = {
  type: "object",
  properties: {
    persona: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        icon: { type: "string", enum: ["Discovery", "Code", "Learn", "Social", "Entertainment", "Other"] }
      },
      required: ["title", "description", "icon"]
    },
    trends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["title", "description"]
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" }
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
    const cleaned = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
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
            3.  Return ONLY a valid JSON array, no markdown, no explanation. If there are multiple days, return an array of JSON objects.
        `,
        overall: `
            Below is a JSON array of the user's past digital diaries. Analyze this data to create a summary of the user's overall digital habits.

            Instructions:
            1.  **Determine a Digital Persona**: Based on the user's most dominant activities, create a creative digital persona profile (e.g., 'Digital Explorer', 'Focused Developer', 'Curious Learner'). Define this persona with a title, a short description, and an appropriate icon name.
            2.  **Identify Trends**: Compare activity data over time to identify 2-3 significant trends. For example, "Recent increase in software development activities" or "Weekend consumption of entertainment-focused content." Present each trend with a title and description.
            3.  **Provide Recommendations**: Based on the analysis, provide 2-3 personalized and actionable recommendations to improve the user's digital well-being or productivity. The recommendations should be positive and encouraging. Present each recommendation with a title and description.
            4.  Return ONLY a valid JSON object, no markdown, no explanation.
        `
    }
}

export class OpenRouterProvider implements AIProviderService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async chatCompletion(
    prompt: string,
    schema: object,
    temperature: number
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Digital Diary Assistant'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API Error:", error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
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
      const responseText = await this.chatCompletion(prompt, diaryEntryJsonSchema, 0.7);
      const parsedData = parseJsonResponse(responseText);

      if (!Array.isArray(parsedData)) {
        if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData as any]; 
        }
        throw new Error("Expected array format from API was not received.");
      }
      return parsedData;

    } catch (error) {
      console.error("OpenRouter API Error:", error);
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
      const responseText = await this.chatCompletion(prompt, overallAnalysisJsonSchema, 0.8);
      return parseJsonResponse(responseText);

    } catch (error) {
      console.error("OpenRouter API Error (Overall Analysis):", error);
      if (error instanceof Error) throw error;
      throw new Error("A problem occurred with the AI during the overall analysis.");
    }
  }
}
