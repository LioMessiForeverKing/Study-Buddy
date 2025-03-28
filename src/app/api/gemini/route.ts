import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const apiKey = 'AIzaSyDB5uL5w8v3ijAdg40ZTfW9K9iM6Bsgzrg'
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    // Initialize file manager for uploading files
    const fileManager = new GoogleAIFileManager(apiKey);

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

    // Get the image data and conversation history from the request
    const { imageData, question, history = [] } = await request.json();
    
    if (!imageData) {
      return new Response(JSON.stringify({ error: "No image data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageData.split(',')[1];
    
    // Upload the image to Gemini using file upload mechanism
    const tempFilePath = `/tmp/canvas-${Date.now()}.png`;
    fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
    
    // Upload to Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "image/png",
      displayName: `canvas-${Date.now()}`,
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Format conversation history for Gemini API
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Start a chat session with conversation history
    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });

    // Send the image to Gemini with a prompt using fileData instead of inlineData
    const result = await chatSession.sendMessage([
      { text: question },
      {
        fileData: {
          mimeType: "image/png",
          fileUri: uploadResult.file.uri
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