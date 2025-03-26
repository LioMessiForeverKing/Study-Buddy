import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    // Hardcoded API key for testing purposes only
    // TODO: Remove this hardcoded key and use environment variables in production
    const apiKey = "AIzaSyCPqcdHwQ6V8kSl1hQ4k1pMzB7wAHi6S-4";
    
    // Uncomment the line below to use environment variables instead
    // const apiKey = process.env.GEMINI_API_KEY;

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21",
    });

    // Configuration for the generation
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
      responseMimeType: "text/plain",
    };

    // Get the image data from the request
    const { imageData, question } = await request.json();
    
    if (!imageData) {
      return new Response(JSON.stringify({ error: "No image data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageData.split(',')[1];

    // Start a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the image to Gemini with a prompt
    const result = await chatSession.sendMessage([
      { text: question },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Data
        }
      }
    ]);

    // Get the response text
    const responseText = result.response.text();

    // Return the response
    return new Response(JSON.stringify({ analysis: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Failed to process the image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}