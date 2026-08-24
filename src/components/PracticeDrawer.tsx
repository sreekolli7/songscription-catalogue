'use client';

import React, { useState } from 'react';
import { Song } from '@/types/song';
import { supabase } from '@/lib/supabase';

interface PracticeDrawerProps {
  song: Song | null;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<Song>) => void;
  onDelete: (id: string, filePath: string) => void;
}

// This slide-over panel provides the detailed practice workflow for an individual transcription,
// including difficulty benchmarking, playback controls, and session tracking.
export default function PracticeDrawer({ song, onClose, onUpdate, onDelete }: PracticeDrawerProps) {
  const [practiceSpeed, setPracticeSpeed] = useState<number>(100);
  const [handMode, setHandMode] = useState<'both' | 'right' | 'left'>('both');
  const [sessionActive, setSessionActive] = useState(false);

  if (!song) return null;

  // Assigns a skill level to the selected arrangement and persists it in the database as a refinement
  // to the original automatic metadata profile.
  const handleSetDifficulty = async (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    onUpdate(song.id, { difficulty: level });
    await supabase.from('songs').update({ difficulty: level }).eq('id', song.id);
  };

  // Starts or ends a practice session and records the activity timestamp and cumulative count for later
  // analysis of the learner's progress.
  const handleStartPractice = async () => {
    const nextState = !sessionActive;
    setSessionActive(nextState);

    if (nextState) {
      const changes = {
        last_practiced_at: new Date().toISOString(),
        practice_count: (song.practice_count ?? 0) + 1,
      };
      onUpdate(song.id, changes);
      await supabase.from('songs').update(changes).eq('id', song.id);
    }
  };

  // Confirms the deletion request before removing the composition from the catalogue and storage.
  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${song.title}"? This can't be undone.`);
    if (confirmed) {
      onDelete(song.id, song.file_path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                Transcription Studio
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all text-xs font-mono"
            >
              ESC ✕
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {song.difficulty ?? 'Unrated'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">{song.key_signature}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">{song.title}</h2>

            <div className="mt-3">
              <label className="text-xs text-zinc-400 block mb-1.5 font-mono">Rate difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSetDifficulty(level)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      song.difficulty === level
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Tempo</span>
              <p className="text-lg font-bold text-white mt-0.5">{song.tempo} <span className="text-[10px] text-zinc-400 font-normal">BPM</span></p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Notes</span>
              <p className="text-lg font-bold text-white mt-0.5">{song.note_count}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Density</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {(song.note_count / (song.duration || 1)).toFixed(1)} <span className="text-[10px] text-zinc-400 font-normal">n/s</span>
              </p>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Practice Configuration</h4>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-mono">
                <span>Playback Speed</span>
                <span className="text-indigo-400 font-semibold">{practiceSpeed}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={practiceSpeed}
                onChange={(e) => setPracticeSpeed(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-mono">Hand Split Focus</label>
              <div className="grid grid-cols-3 gap-2">
                {(['both', 'right', 'left'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHandMode(mode)}
                    className={`py-1.5 text-xs font-medium rounded-lg border capitalize transition-all ${
                      handMode === mode
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode === 'both' ? 'Both Hands' : `${mode} Hand`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6 flex flex-col items-center justify-center min-h-[160px] text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-zinc-300">Interactive Piano Roll Engine</p>
              <p className="text-[11px] text-zinc-500 max-w-xs font-mono">Storage: {song.file_path}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 space-y-2">
          <button
            onClick={handleStartPractice}
            className={`w-full py-3.5 font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              sessionActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <span>{sessionActive ? '● Practice Session Active' : 'Start Interactive Practice'}</span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full py-2.5 font-medium text-xs rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
          >
            Delete from catalogue
          </button>
        </div>
      </div>
    </div>
  );
}