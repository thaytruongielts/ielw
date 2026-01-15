
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeExercise, EvaluationResult, TaskTopic } from "../types";
import { SYSTEM_INSTRUCTION_GENERATOR, SYSTEM_INSTRUCTION_EVALUATOR } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateExercise = async (topic: TaskTopic): Promise<PracticeExercise> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an IELTS Writing Task 2 exercise for this topic: "${topic.question}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullParagraph: { type: Type.STRING },
          slashVersion: { type: Type.STRING }
        },
        required: ["fullParagraph", "slashVersion"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    topic,
    fullParagraph: data.fullParagraph,
    slashVersion: data.slashVersion
  };
};

export const evaluateResponse = async (
  original: string,
  userText: string
): Promise<EvaluationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Original: "${original}"\nUser Input: "${userText}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_EVALUATOR,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          accuracy: { type: Type.NUMBER },
          grammarScore: { type: Type.NUMBER },
          vocabularyScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          corrections: { type: Type.STRING }
        },
        required: ["accuracy", "grammarScore", "vocabularyScore", "feedback", "corrections"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    originalText: original,
    userText: userText
  };
};
