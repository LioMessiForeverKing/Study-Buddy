"use server"
import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import { NextRequest } from 'next/server';

// Add the ConversationMessage interface
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
    const { imageData, allPagesData = [], currentPageIndex = 0, question, history = [], textElements = [] } = await request.json();
    
    if ((!imageData && !allPagesData.length) || !question) {
      console.error('Missing required image data or question');
      return new Response(JSON.stringify({ error: 'Missing required data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Process current canvas data (for backward compatibility)
    const base64CanvasData = imageData ? imageData.split(',')[1] : null;
    const canvasFileUri = base64CanvasData ? await uploadCanvasData(base64CanvasData) : null;
    
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
    
    // Format conversation history for Gemini API
    const formattedHistory: Content[] = history.map((msg: ConversationMessage) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }] as Part[]
    }));
    
    // Start chat session with conversation history
    console.log('Starting chat session with Gemini...');
    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });
    
    // Prepare text elements information if available
    let textElementsInfo = '';
    
    // If we have multi-page data, include information from all pages
    if (allPagesData && allPagesData.length > 0) {
      textElementsInfo = '\n\nCanvas contains multiple pages with the following elements:\n';
      
      allPagesData.forEach((page: { textElements: { text: string; x: number; y: number; }[]; pageNumber: any; }, pageIdx: any) => {
        if (page.textElements && page.textElements.length > 0) {
          textElementsInfo += `\nPage ${page.pageNumber}${pageIdx === currentPageIndex ? ' (Current Page)' : ''}:\n`;
          page.textElements.forEach((element: { text: string; x: number; y: number }, elemIdx: number) => {
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
      textElements.forEach((element: { text: string; x: number; y: number }, index: number) => {
        textElementsInfo += `${index + 1}. Text: "${element.text}" at position (${element.x}, ${element.y})\n`;
      });
    }
    
    // Send message with canvas images and text elements info
    const messageParts: Part[] = [
      { text: question + textElementsInfo }
    ];
    
    // Add all page images if available
    if (pageFileUris.length > 0) {
      // First add the current page image
      const currentPageUri = pageFileUris.find(p => p.pageNumber === currentPageIndex + 1)?.fileUri || canvasFileUri;
      if (currentPageUri) {
        messageParts.push({
          fileData: {
            mimeType: 'image/png',
            fileUri: currentPageUri,
          }
        } as Part);
      }
      
      // Then add other page images
      for (const page of pageFileUris) {
        if (page.pageNumber !== currentPageIndex + 1 && page.fileUri) {
          messageParts.push({
            fileData: {
              mimeType: 'image/png',
              fileUri: page.fileUri,
            }
          } as Part);
        }
      }
    } 
    // Fallback to single image for backward compatibility
    else if (canvasFileUri) {
      messageParts.push({
        fileData: {
          mimeType: 'image/png',
          fileUri: canvasFileUri,
        }
      } as Part);
    }
    
    const result = await chatSession.sendMessage(messageParts);
    
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
