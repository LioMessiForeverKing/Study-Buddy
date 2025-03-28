'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onAudioSubmit: (audioData: string, mimeType: string) => Promise<void>;
}

export function AudioRecorder({ onAudioSubmit }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async () => {
    if (!audioURL) return;

    try {
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        // Remove the data URL prefix
        const base64Data = base64Audio.split(',')[1];
        onAudioSubmit(base64Data, audioBlob.type);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md text-white transition ${isRecording
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {audioURL && (
        <>
          <audio src={audioURL} controls className="h-10" />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Analyze Audio
          </button>
        </>
      )}
    </div>
  );
}