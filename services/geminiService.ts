
import { GoogleGenAI, Type } from "@google/genai";
import { DiaryEntry } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Günün özeti için ilgi çekici ve yaratıcı bir başlık. Örneğin 'Kod ve Kedi Merakıyla Dolu Bir Gün'."
    },
    summary: {
      type: Type.STRING,
      description: "Kullanıcının günü için kişisel ve hikaye tarzında bir özet. Birinci tekil şahıs (sen) kullanarak samimi bir dil kullan. Önemli aktivitelere ve harcanan zamana odaklan. Örneğin: 'Bugün GitHub'da Roo Code projesine göz atarak güne başladın...'."
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
    }
  },
  required: ["title", "summary", "categories"]
};

export const analyzeBrowsingHistory = async (history: string): Promise<DiaryEntry> => {
  const prompt = `
    Aşağıdaki tarayıcı geçmişi verilerini analiz et ve kullanıcı için kişisel bir dijital günlük özeti oluştur.
    
    Talimatlar:
    1.  Verileri dikkatlice incele. Tekrarlanan ve alakasız girişleri (reklamlar, yönlendirmeler, cdn'ler vb.) göz ardı et.
    2.  Benzer aktiviteleri gruplandır (örneğin, birden fazla GitHub ziyareti 'Yazılım Geliştirme' olarak, farklı haber siteleri 'Haberler' olarak).
    3.  Kullanıcının gününü anlatan, samimi ve kişisel bir hikaye oluştur. Önemli aktivite gruplarına odaklan.
    4.  Cevabı istenen JSON formatında, Türkçe olarak döndür.
    
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
    
    // Attempt to parse the JSON string from the API response
    const parsedData: DiaryEntry = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
       throw new Error("Yapay zeka beklenmedik bir formatta yanıt verdi. Lütfen girdiğinizi kontrol edip tekrar deneyin.");
    }
    throw new Error("Yapay zeka ile iletişim kurarken bir sorun oluştu.");
  }
};
