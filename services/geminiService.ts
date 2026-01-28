
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { FinancialAnalysis, Transaction } from "../types";

// Note: API Key is handled by process.env.API_KEY.
// Fix: Always use named parameter for GoogleGenAI initialization.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a professional logo for the brand.
 * Fix: Upgraded to 'gemini-3-pro-image-preview' to support high-quality/4K resolution as requested.
 */
export const generateLogo = async (brandDescription: string = "FinanzaGo.Ai - Inteligência Financeira"): Promise<string> => {
  const ai = getAI();
  const prompt = `A professional, minimalist, and high-end logo for a fintech brand named "${brandDescription}". 
  The logo should feature a modern abstract symbol representing growth, flow, and artificial intelligence. 
  Colors: Deep indigo blue, vibrant cyan, and silver accents. 
  Style: Flat design, vector style, white background, clean lines, suitable for a mobile app icon. 
  High quality, 4k resolution.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "4K" // Required for 4K quality with gemini-3-pro-image-preview.
      }
    }
  });

  // Find the image part in the response
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Falha ao gerar o logotipo.");
};

/**
 * Analyzes one or more bank statement texts or images to extract financial data and suggestions.
 * Uses gemini-3-pro-preview for complex reasoning.
 */
export const analyzeStatement = async (contents: (string | { data: string; mimeType: string })[]): Promise<FinancialAnalysis> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Analise os seguintes extratos bancários ou listas de transações (podem ser vários arquivos ou textos combinados). 
    Consolide todas as informações em uma única visão financeira.
    Retorne um JSON estruturado com:
    - summary (um parágrafo resumindo a saúde financeira consolidada)
    - totalExpenses (número total de despesas somadas de todos os documentos)
    - totalIncome (número total de receitas somadas de todos os documentos)
    - topCategories (um array de {category: string, amount: number} consolidado)
    - suggestions (um array de strings com dicas práticas de economia baseadas no conjunto de dados)
    - transactions (um array com TODAS as transações individuais encontradas: {date: string, description: string, amount: number, category: string, type: 'expense' | 'income'})
    
    Se houver transações suspeitas ou recorrentes desnecessárias em qualquer um dos arquivos, mencione nas sugestões.
    Responda APENAS o JSON.
  `;

  const parts = contents.map(content => 
    typeof content === 'string' 
      ? { text: content } 
      : { inlineData: content }
  );

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 32768 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          totalExpenses: { type: Type.NUMBER },
          totalIncome: { type: Type.NUMBER },
          topCategories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER }
              }
            }
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['expense', 'income'] }
              },
              required: ["date", "description", "amount", "category", "type"]
            }
          }
        },
        required: ["summary", "totalExpenses", "totalIncome", "topCategories", "suggestions", "transactions"]
      }
    }
  });

  // Extracting text from response.text property (not method).
  return JSON.parse(response.text || "{}") as FinancialAnalysis;
};

/**
 * Chat with AI for financial advice.
 * Uses gemini-3-flash-preview with googleSearch for up-to-date market info.
 */
export const chatWithAI = async (message: string, history: any[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "Você é um consultor financeiro especialista em economia doméstica e investimentos. Ajude o usuário a economizar e investir melhor. Use busca no Google se necessário para taxas atuais, inflação ou notícias econômicas do Brasil.",
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * Converts text to speech for financial summaries.
 * Uses gemini-2.5-flash-preview-tts.
 */
export const speakSummary = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Diga com tom profissional e encorajador: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  }
};

// Helpers for Audio Decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
