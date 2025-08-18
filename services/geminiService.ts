
import { GoogleGenAI, Type } from "@google/genai";
import { DiaryEntry } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const diaryEntrySchema = {
  type: Type.OBJECT,
  properties: {
    date: {
      type: Type.STRING,
      description: "Analiz edilen geçmiş verilerinin tarihi. Örneğin: '25 Temmuz 2024, Perşembe'."
    },
    title: {
      type: Type.STRING,
      description: "Günün özeti için ilgi çekici ve yaratıcı bir başlık. Örneğin 'Kod, Haber ve Keşif Dolu Bir Gün'."
    },
    summary: {
      type: Type.OBJECT,
      description: "Günü zaman dilimlerine (sabah, öğlen, akşam) göre ayıran hikaye tarzı bir özet. Samimi bir dil kullan.",
      properties: {
        sabah: { type: Type.STRING, description: "Sabah saatlerindeki aktivitelerin özeti." },
        oglen: { type: Type.STRING, description: "Öğlen saatlerindeki aktivitelerin özeti." },
        aksam: { type: Type.STRING, description: "Akşam saatlerindeki aktivitelerin özeti." }
      },
      required: ["sabah", "oglen", "aksam"]
    },
    highlights: {
      type: Type.ARRAY,
      description: "Günün en önemli 3-4 aktivitesini ikon adıyla birlikte listele.",
      items: {
        type: Type.OBJECT,
        properties: {
          activity: { type: Type.STRING, description: "Öne çıkan aktivitenin kısa açıklaması." },
          icon: {
            type: Type.STRING,
            description: "Aktiviteyi en iyi temsil eden ikon adı. Seçenekler: 'code', 'news', 'shop', 'learn', 'entertainment', 'social', 'research', 'other'."
          }
        },
        required: ["activity", "icon"]
      }
    },
    categories: {
      type: Type.ARRAY,
      description: "URL'lere göre aktivite kategorilerinin bir listesi ve her kategorideki aktivite sayısı.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Aktivitenin kategorisi (örneğin: 'Yazılım Geliştirme', 'Haberler', 'Sosyal Medya', 'Eğitim', 'Alışveriş')."
          },
          activities: {
            type: Type.INTEGER,
            description: "Bu kategorideki ilgili URL ziyaretlerinin sayısı."
          }
        },
        required: ["category", "activities"]
      }
    },
    scores: {
        type: Type.ARRAY,
        description: "Günün aktivitelerine göre farklı alanlarda 5 üzerinden puanlama ve kısa geri bildirim.",
        items: {
            type: Type.OBJECT,
            properties: {
                area: { type: Type.STRING, description: "Puanlama alanı. Seçenekler: 'Üretkenlik', 'Öğrenme', 'Keşif', 'Eğlence'."},
                score: { type: Type.INTEGER, description: "Aktivite alanının 5 üzerinden puanı."},
                feedback: { type: Type.STRING, description: "Puana dayalı kısa, motive edici bir geri bildirim."}
            },
            required: ["area", "score", "feedback"]
        }
    }
  },
  required: ["date", "title", "summary", "highlights", "categories", "scores"]
};

const responseSchema = {
    type: Type.ARRAY,
    items: diaryEntrySchema
};


export const analyzeBrowsingHistory = async (history: string): Promise<DiaryEntry[]> => {
  const prompt = `
    Aşağıdaki tarayıcı geçmişi verilerini analiz et ve kullanıcı için kişisel bir dijital günlük özeti oluştur.
    
    Talimatlar:
    1.  Verileri dikkatlice incele. Veride birden fazla gün varsa, her gün için ayrı bir günlük nesnesi oluştur. Tarihleri belirgin bir şekilde ayır.
    2.  Her gün için:
        a. Tekrarlanan ve alakasız girişleri (reklamlar, yönlendirmeler, cdn'ler vb.) göz ardı et.
        b. Benzer aktiviteleri gruplandır (örneğin, birden fazla GitHub ziyareti 'Yazılım Geliştirme' olarak, farklı haber siteleri 'Haberler' olarak).
        c. Günlük özeti, zaman akışına göre (sabah, öğlen, akşam) bölümlere ayırarak hikayeleştir.
        d. Günün en önemli 3-4 aktivitesini 'highlights' olarak belirle ve uygun bir ikon adı ata.
        e. Aktiviteleri analiz ederek 'Üretkenlik', 'Öğrenme', 'Keşif' ve 'Eğlence' alanlarında 5 üzerinden puanla ve her biri için kısa, yapıcı bir 'feedback' yaz.
    3.  Cevabı istenen JSON formatında, Türkçe olarak döndür. Birden fazla gün varsa, JSON nesnelerinden oluşan bir dizi döndür.
    
    Tarayıcı Geçmişi Verisi:
    ---
    ${history}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("API'den boş yanıt alındı. Lütfen tekrar deneyin.");
    }
    
    const parsedData: DiaryEntry[] = JSON.parse(jsonText);

    // Ensure the response is an array
    if (!Array.isArray(parsedData)) {
        // If the API returned a single object, wrap it in an array
        if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData as any]; 
        }
        throw new Error("API'den beklenen dizi formatı alınamadı.");
    }

    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
       throw new Error("Yapay zeka beklenmedik bir formatta yanıt verdi. Lütfen girdiğinizi kontrol edip tekrar deneyin.");
    }
    throw new Error("Yapay zeka ile iletişim kurarken bir sorun oluştu.");
  }
};
