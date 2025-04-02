import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Eleven Labs API configuration
    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'your-api-key';
    const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Example voice ID (you can change this)

    // Make request to Eleven Labs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();

    // Convert ArrayBuffer to Base64
    const base64Audio = Buffer.from(audioData).toString('base64');

    return new Response(
      JSON.stringify({
        audioData: base64Audio,
        format: 'audio/mpeg',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error processing text-to-speech request:", error);
    return new Response(JSON.stringify({ error: "Failed to convert text to speech" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}