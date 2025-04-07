"use server"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import mime from 'mime-types';
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
 * Uploads a file to Gemini
 * @param audioData - Base64 encoded audio data
 * @param mimeType - MIME type of the audio file
 */
async function uploadToGemini(audioData: string, mimeType: string) {
  console.log('Starting file upload to Gemini...');
  
  try {
    // Create a temporary file
    const tempFilePath = `/tmp/audio-${Date.now()}.${mime.extension(mimeType)}`;
    fs.writeFileSync(tempFilePath, Buffer.from(audioData, 'base64'));
    
    // Upload to Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType,
      displayName: `audio-${Date.now()}`,
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    console.log(`Successfully uploaded file as: ${uploadResult.file.name}`);
    return uploadResult.file;
  } catch (error) {
    console.error('Error uploading file to Gemini:', error);
    throw error;
  }
}

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
  console.log('Received audio processing request');
  
  try {
    // Get audio data and conversation history from request
    const { audioData, mimeType, prompt, canvasData, allPagesData = [], currentPageIndex = 0, history = [], textElements = [] } = await request.json();
    
    if (!audioData || !mimeType || !prompt) {
      console.error('Missing required audio data or mime type');
      return new Response(JSON.stringify({ error: 'Missing required audio data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Upload audio to Gemini
    const file = await uploadToGemini(audioData, mimeType);

    // Process canvas data if provided (for backward compatibility)
    let canvasInlineData = null;
    if (canvasData) {
      const base64CanvasData = canvasData.split(',')[1];
      const canvasFileUri = await uploadCanvasData(base64CanvasData);
      canvasInlineData = {
        fileData: {
          mimeType: "image/png",
          fileUri: canvasFileUri
        }
      };
    }
    
    // Process all pages data if available
    const pageFileUris = [];
    if (allPagesData && allPagesData.length > 0) {
      for (const page of allPagesData) {
        if (page.imageData) {
          const base64Data = page.imageData.split(',')[1];
          const fileUri = await uploadCanvasData(base64Data);
          pageFileUris.push({
            pageNumber: page.pageNumber,
            fileUri: fileUri
          });
        }
      }
    }
    
    // Initialize model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
    });
    
    // Define interfaces for type safety
    interface TextElement {
      id?: string;
      x: number;
      y: number;
      text: string;
      color?: string;
      fontSize?: number;
    }
    
    interface CanvasPage {
      pageNumber: number;
      textElements?: TextElement[];
      imageData?: string;
    }
    
    interface ConversationMessage {
      role: string;
      content: string;
    }
    
    // Format conversation history for Gemini API
    const formattedHistory = history.map((msg: ConversationMessage) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Start chat session with conversation history
    console.log('Starting chat session with Gemini...');
    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });
    
    // Send message with audio file
    // Prepare text elements information if available
    let textElementsInfo = '';
    
    // If we have multi-page data, include information from all pages
    if (allPagesData && allPagesData.length > 0) {
      textElementsInfo = '\n\nCanvas contains multiple pages with the following elements:\n';
      
      allPagesData.forEach((page: CanvasPage, pageIdx: number) => {
        if (page.textElements && page.textElements.length > 0) {
          textElementsInfo += `\nPage ${page.pageNumber}${pageIdx === currentPageIndex ? ' (Current Page)' : ''}:\n`;
          page.textElements.forEach((element: TextElement, elemIdx: number) => {
            textElementsInfo += `  ${elemIdx + 1}. Text: "${element.text}" at position (${element.x}, ${element.y})\n`;
          });
        } else {
          textElementsInfo += `\nPage ${page.pageNumber}${pageIdx === currentPageIndex ? ' (Current Page)' : ''}: No text elements\n`;
        }
      });
    }
    // For backward compatibility, use the single page text elements if no multi-page data
    else if (textElements && textElements.length > 0) {
      textElementsInfo = '\n\nText elements on the canvas:\n';
      textElements.forEach((element: TextElement, index: number) => {
        textElementsInfo += `${index + 1}. Text: "${element.text}" at position (${element.x}, ${element.y})\n`;
      });
    }
    
    const messageParts = [
      { text: prompt + textElementsInfo },
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
    ];

    // Add all page images if available
    if (pageFileUris.length > 0) {
      // First add the current page image
      const currentPageUri = pageFileUris.find(p => p.pageNumber === currentPageIndex + 1)?.fileUri;
      if (currentPageUri) {
        messageParts.push({
          fileData: {
            mimeType: 'image/png',
            fileUri: currentPageUri,
          },
        });
      }
      
      // Then add other page images
      for (const page of pageFileUris) {
        if (page.pageNumber !== currentPageIndex + 1 && page.fileUri) {
          messageParts.push({
            fileData: {
              mimeType: 'image/png',
              fileUri: page.fileUri,
            },
          });
        }
      }
    }
    // Fallback to single canvas image for backward compatibility
    else if (canvasInlineData) {
      messageParts.push(canvasInlineData);
    }

    const result = await chatSession.sendMessage(messageParts);
    
    // Process response
    const responseText = result.response.text();
    console.log('Successfully processed audio with Gemini');
    
    return new Response(JSON.stringify({ analysis: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    return new Response(JSON.stringify({ error: 'Failed to process audio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}