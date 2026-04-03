const TEXT_MODEL = 'gemini-1.5-flash';
const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`;

async function test() {
  const apiKey = 'YOUR_API_KEY_HERE';
  const prompt = `You are a fitness AI. Based on a user's BMI (Weight: 70kg, Height: 175cm) and today's inputs (Calories: 0 kcal, Exercise: 0 mins), estimate their current physical stats as percentages. Keep it realistic but reflect their extreme inputs if present. Return ONLY a JSON object with strictly these numerical keys: armFat, legFat, coreFat, musclePercentage. Do not use markdown backticks.`;

  const response = await fetch(`${GEMINI_TEXT_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error(`Failed to generate stats: ${response.status} - ${errText}`);
    return;
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
