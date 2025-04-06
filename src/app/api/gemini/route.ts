"use server"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import { NextRequest } from 'next/server';

// Initialize Gemini API client and file manager
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Configuration for Gemini model
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: 'text/plain',
};

/**
 * Uploads canvas data to Gemini and returns the file URI
 * @param base64CanvasData - Base64 encoded canvas data
 */
async function uploadCanvasData(base64CanvasData: string): Promise<string> {
  console.log('Starting canvas data upload to Gemini...');
  
  try {
    // Create a temporary file for the canvas data
    const tempFilePath = `/tmp/canvas-${Date.now()}.png`;
    fs.writeFileSync(tempFilePath, Buffer.from(base64CanvasData, 'base64'));
    
    // Upload to Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'image/png',
      displayName: `canvas-${Date.now()}`,
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    console.log(`Successfully uploaded canvas as: ${uploadResult.file.name}`);
    return uploadResult.file.uri;
  } catch (error) {
    console.error('Error uploading canvas data to Gemini:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('Received Gemini analysis request');
  
  try {
    // Get image data, question, and conversation history from request
    const { imageData, question, history = [], textElements = [] } = await request.json();
    
    if (!imageData || !question) {
      console.error('Missing required image data or question');
      return new Response(JSON.stringify({ error: 'Missing required data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Process canvas data
    const base64CanvasData = imageData.split(',')[1];
    const canvasFileUri = await uploadCanvasData(base64CanvasData);
    
    // Initialize model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
    });
    
    // Format conversation history for Gemini API
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Start chat session with conversation history
    console.log('Starting chat session with Gemini...');
    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });
    
    // Prepare text elements information if available
    let textElementsInfo = '';
    if (textElements && textElements.length > 0) {
      textElementsInfo = '\n\nText elements on the canvas:\n';
      textElements.forEach((element: any, index: number) => {
        textElementsInfo += `${index + 1}. Text: "${element.text}" at position (${element.x}, ${element.y})\n`;
      });
    }
    
    // Send message with canvas image and text elements info
    const result = await chatSession.sendMessage([
      { text: question + textElementsInfo },
      {
        fileData: {
          mimeType: 'image/png',
          fileUri: canvasFileUri,
        },
      },
    ]);
    
    // Process response
    const responseText = result.response.text();
    console.log('Successfully processed image with Gemini');
    
    return new Response(JSON.stringify({ analysis: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(JSON.stringify({ error: 'Failed to process image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}