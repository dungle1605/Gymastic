import type { UserProfile, UserMetrics } from '../store/UserActivityStore';

const GEMINI_MODEL = 'gemini-3.1-flash-image-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(profile: UserProfile, metrics: UserMetrics): string {
  // --- physical shape from BMI & Calories ---
  const heightM = profile.height / 100;
  const bmi = profile.weight / (heightM * heightM);
  let bodyType = 'athletic build';
  
  // Base off BMI
  if (bmi < 18.5) bodyType = 'lean and slender build';
  else if (bmi < 25) bodyType = 'healthy and athletic build';
  else if (bmi < 30) bodyType = 'stocky and strong build';
  else bodyType = 'large and heavy build';

  // Override / exaggerate based on extreme daily calorie intake
  if (metrics.calories >= 5000) {
    bodyType = 'very obese and extremely fat build with a large round belly';
  } else if (metrics.calories >= 3500) {
    bodyType = 'visibly chubby and overweight build';
  } else if (metrics.calories > 0 && metrics.calories <= 1500) {
    bodyType = 'extremely skinny and shredded build with visible abs and very low body fat';
  }

  // --- height ---
  let heightDesc = 'average height';
  if (profile.height >= 185) heightDesc = 'very tall';
  else if (profile.height >= 175) heightDesc = 'tall';
  else if (profile.height <= 160) heightDesc = 'short';

  // --- mood from metrics ---
  const isTired = metrics.sleepHours > 0 && metrics.sleepHours < 6;
  const isPumped = metrics.exerciseMins >= 60;
  const isHappy = metrics.exerciseMins >= 30 && metrics.sleepHours >= 7;
  let mood = 'showing a calm, friendly, and neutral facial expression';
  if (isTired) mood = 'looking somewhat exhausted and sleepy with relaxed eyelids';
  else if (isPumped) mood = 'showing a highly energetic, confident expression with a wide enthusiastic smile';
  else if (isHappy) mood = 'showing a bright, happy, and cheerful smiling expression';

  // --- hair color ---
  const hairColor = profile.hairColor || 'brown';

  // --- gender ---
  const genderDesc = profile.gender === 'female' ? 'female character' : profile.gender === 'other' ? 'non-binary character' : 'boy character';

  const prompt = [
    `Using the attached image as the literal, exact original blueprint, please modify this exact character (same clothes, face, features) only by applying the following:`,
    `Body Mod: Change them to have a ${bodyType}.`,
    `Height Mod: Make them appear as a ${heightDesc} ${genderDesc}.`,
    `Hair: Their hair color is ${hairColor}.`,
    `Expression/Mood: They are ${mood}.`,
    `Do not change the art style or colors. Maintain the exact same highly polished modern 2D cartoon style, perfectly centered. MUST be on a solid pure solid white background.`
  ].join(' ');

  return prompt;
}
async function getBaseCharacterBase64(): Promise<string> {
  const response = await fetch('/base_character.png');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateAvatarImage(
  profile: UserProfile,
  metrics: UserMetrics,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  const prompt = buildPrompt(profile, metrics);
  const base64CharacterData = await getBaseCharacterBase64();

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: base64CharacterData } }
        ]
      }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Walk the parts to find inlineData with an image
  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] =
    data?.candidates?.[0]?.content?.parts ?? [];

  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'));
  if (!imagePart?.inlineData) {
    throw new Error('No image returned from Gemini API. Check model or prompt.');
  }

  const originalBase64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

  // Magically remove the pure white background using a temporary canvas to ensure the Stats HUD shows through!
  const transparentBase64 = await new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(originalBase64);
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Flood erase white pixels (R, G, B > 245)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 245 && data[i+1] > 245 && data[i+2] > 245) {
          data[i+3] = 0; // Set Alpha to 0
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(originalBase64);
    img.src = originalBase64;
  });

  return transparentBase64;
}

export interface AvatarStats {
  armFat: number;
  legFat: number;
  coreFat: number;
  musclePercentage: number;
}

const TEXT_MODEL = 'gemini-flash-latest';
const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`;

export async function generateAvatarStats(profile: UserProfile, metrics: UserMetrics): Promise<AvatarStats> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY missing');

  const prompt = `You are a fitness AI. Based on a user's BMI (Weight: ${profile.weight}kg, Height: ${profile.height}cm) and today's inputs (Calories: ${metrics.calories} kcal, Exercise: ${metrics.exerciseMins} mins), estimate their current physical stats as percentages. Keep it realistic but reflect their extreme inputs if present. Return ONLY a JSON object with strictly these numerical keys: armFat, legFat, coreFat, musclePercentage. Do not use markdown backticks.`;

  const response = await fetch(`${GEMINI_TEXT_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to generate stats: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const rawJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(rawJson) as AvatarStats;
  } catch (e) {
    console.error("Failed to parse AI stats", e, text);
    return { armFat: 15, legFat: 18, coreFat: 20, musclePercentage: 45 };
  }
}
