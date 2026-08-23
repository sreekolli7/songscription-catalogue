'use client';

import React, { useState, useRef } from 'react';
import { Song } from '@/types/song';

interface MidiUploaderProps {
  onUploadSuccess: (newSong: Song) => void;
}

export default function MidiUploader({ onUploadSuccess }: MidiUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      setErrorMessage('Please upload a valid .mid or .midi file.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      onUploadSuccess(data.song);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[0.99]'
            : 'border-zinc-800/80 hover:border-zinc-700 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 hover:from-zinc-900 hover:to-zinc-900 shadow-xl shadow-black/20'
        } ${isUploading ? 'opacity-70 cursor-wait' : ''}`}
      >
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
          }}
        />

        <div className="relative z-10 py-10 px-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:scale-105 group-hover:border-indigo-500/40 transition-all duration-300 shadow-md">
              {isUploading ? (
                <svg className="w-6 h-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          </div>

          <p className="text-base font-medium text-zinc-100 tracking-tight">
            {isUploading ? 'Transcribing and indexing MIDI tracks...' : 'Import new transcription'}
          </p>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-sm">
            Drag & drop a <span className="text-zinc-300 font-mono">.mid</span> file or click to browse. We&apos extract tempos, tracks, notes, and skill tiers automatically.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 text-center font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}