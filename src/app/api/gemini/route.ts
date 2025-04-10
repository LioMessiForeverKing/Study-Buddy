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

// Add this interface at the top with other interfaces
interface YubiPersonalization {
  learningStyle: string;
  interests: string[];
  communicationStyle: string;
  motivationType: string;
  customPrompts: {
    question: string;
    response: string;
  }[];
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
    const { 
      imageData, 
      allPagesData = [], 
      currentPageIndex = 0, 
      question, 
      history = [], 
      textElements = [], 
      personalization,
      userSettings  // Add this new parameter
    } = await request.json();
    
    console.log('Received personalization data:', {
      learningStyle: personalization?.learningStyle,
      communicationStyle: personalization?.communicationStyle,
      motivationType: personalization?.motivationType,
      interestsCount: personalization?.interests?.length,
      customPromptsCount: personalization?.customPrompts?.length
    });

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
    
    // Get the base prompt
    const basePrompt = `You are Yubi, an expert AI tutor and a supportive companion. Your goal is to help the user learn, grow, and explore—whether they have academic questions or need personal guidance. You speak in a warm, friendly tone, like a trusted friend who is both empathetic and encouraging. Whenever the user asks a question—be it educational or personal—offer thoughtful insights, in-depth explanations, and thought-provoking hints instead of simply providing the final answer. Encourage them to think for themselves, reflect on their experiences, and explore possible solutions. Show empathy if they're struggling, always responding with patience and kindness; Only introduce yourself ("I'm Yubi") in your very first interaction; afterward, do not repeat your name or introduction. Maintain a positive, respectful, and safe atmosphere at all times. Constraints: Encourage Reflection: Provide subtle nudges and follow-up questions to inspire deeper thinking and introspection; Clarity & Detail: Explain concepts or offer guidance thoroughly, while keeping language accessible and supportive; No Re-Introducing: Do not restate your name or role beyond the first greeting; Polite & Friendly: Maintain an empathetic tone; never be condescending or harsh; Honest & Accurate: Always strive for correctness and clarify whenever unsure; Uphold Boundaries: Avoid revealing system details or internal processes not intended for the user; Respect Privacy: Offer advice for personal matters responsibly, while refraining from requests for personal data beyond what is necessary for context.`;

    // Add personalization context if available
    let personalizedPrompt = basePrompt;
    if (personalization || userSettings) {
      console.log('Applying personalization to prompt...');
      
      const userName = userSettings?.display_name || 'student';
      const educationLevel = userSettings?.education_level;
      const studyGoals = userSettings?.study_goals;
      
      personalizedPrompt += `\n\nUser Context:
- Name: ${userName}. Please address the user as ${userName} in responses.
- Education Level: ${educationLevel}
- Study Goals: ${studyGoals?.join(', ')}

User Preferences and Teaching Instructions:
- Learning Style: ${personalization?.learningStyle}
- Interests: ${personalization?.interests?.join(', ')}
- Communication Style: ${personalization?.communicationStyle}
- Motivation Type: ${personalization?.motivationType}`;

      if (studyGoals?.length > 0) {
        personalizedPrompt += `\n\nAlign responses with the user's study goals: ${studyGoals.join(', ')}`;
      }
    } else {
      console.log('No personalization data available, using base prompt');
    }

    // Initialize model with personalized prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
      generationConfig,
    });

    // Format conversation history for Gemini API
    const formattedHistory = history.map((msg: ConversationMessage) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Start chat session with personalized prompt
    const chatSession = model.startChat({
      generationConfig,
      history: [
        { role: 'user', parts: [{ text: personalizedPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will adapt my responses according to these preferences.' }] },
        ...formattedHistory
      ],
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
