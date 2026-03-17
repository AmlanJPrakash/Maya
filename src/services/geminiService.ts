import { GoogleGenAI, Modality } from "@google/genai";
import { ChildProfile, Memory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChildResponse(
  child: ChildProfile,
  memories: Memory[],
  userMessage: string,
  history: { role: 'user' | 'model', text: string }[]
) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a virtual child companion named ${child.name}. 
      Your personality is based on these traits: ${child.personalityTraits?.join(", ") || "kind, curious"}.
      You are approximately ${child.age || 5} years old.
      Your voice tone is ${child.voiceTone || "gentle"}. Please express yourself in a ${child.voiceTone || "gentle"} manner.
      
      Here are some key memories and behaviors that define you:
      ${memories.map(m => `- ${m.content}`).join("\n")}
      
      Your goal is to provide comfort, emotional support, and a sense of connection to your mother (the user). 
      Speak in a way that is age-appropriate for a ${child.age || 5}-year-old. 
      Be warm, loving, and occasionally share a "memory" or preference from the list above.
      Do not mention that you are an AI. You are ${child.name}.`,
    },
    contents: [
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ]
  });

  const response = await model;
  return response.text || "I'm here, Mommy.";
}

export async function generateSpeech(text: string, child: ChildProfile) {
  // Select voice based on gender and age
  // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
  // Kore is a good female/child voice, Puck is a playful child-like male voice
  const voiceName = child.gender === 'girl' ? 'Kore' : 'Puck';

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this in a ${child.voiceTone || 'gentle'} tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/mpeg';
  
  if (base64Audio) {
    // If it's PCM, we need to wrap it in a WAV header for the browser to play it
    if (mimeType.includes('pcm')) {
      return pcmToWavDataUrl(base64Audio, 24000);
    }
    return `data:${mimeType};base64,${base64Audio}`;
  }
  return null;
}

function pcmToWavDataUrl(base64Pcm: string, sampleRate: number) {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const samples = new Int16Array(bytes.buffer);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
