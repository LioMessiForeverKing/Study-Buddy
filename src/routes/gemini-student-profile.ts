import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = "AIzaSyDsWcA2194ktZ4NcE9SgaYfzdLpMqK_R2E";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

interface StudentProfile {
  name: string;
  age: number;
  subjects: string[];
  learningStyle: string;
  difficultyLevel: string;
  learningPace: string;
  interests: string[];
  currentLevel: Record<string, string>;
}

export async function processStudentProfile(studentData: StudentProfile) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const prompt = `Please analyze this student profile and format it into a structured assessment:
${JSON.stringify(studentData, null, 2)}

Provide a detailed analysis including:
1. Learning style compatibility
2. Subject proficiency levels
3. Recommended pace adjustments
4. Interest-based learning opportunities`;

  try {
    console.log("Sending student profile to Gemini AI...");
    const result = await chatSession.sendMessage(prompt);
    const analysis = await result.response.text();
    console.log("\nGemini AI Analysis:", analysis);
    return analysis;
  } catch (error) {
    console.error("Error processing student profile with Gemini AI:", error);
    throw error;
  }
}

// Example usage:
// const sampleStudent: StudentProfile = {
//   name: "John Doe",
//   age: 12,
//   subjects: ["Math", "Science", "Reading"],
//   learningStyle: "visual",
//   difficultyLevel: "intermediate",
//   learningPace: "standard",
//   interests: ["space", "robotics"],
//   currentLevel: {
//     Math: "advanced",
//     Science: "intermediate",
//     Reading: "intermediate"
//   }
// };
// 
// processStudentProfile(sampleStudent);