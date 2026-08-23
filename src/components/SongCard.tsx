'use client';

import React from 'react';
import { Song } from '@/types/song';

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
  onToggleFavorite: (id: string, current: boolean, e: React.MouseEvent) => void;
}

const difficultyBadge = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Unrated: 'bg-zinc-700/10 text-zinc-400 border-zinc-700/20',
};

export default function SongCard({ song, onSelect, onToggleFavorite }: SongCardProps) {
  // A concise duration formatter preserves readability without needing a third-party time utility.
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={() => onSelect(song)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-950/20 hover:-translate-y-0.5"
    >
      <div>
        {/* Header Row: Difficulty Badge + Favorite Toggle */}
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              difficultyBadge[song.difficulty ?? 'Unrated']
            }`}
          >
            {song.difficulty ?? 'Unrated'}
          </span>
          <button
            onClick={(e) => onToggleFavorite(song.id, song.is_favorite, e)}
            className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
            title="Toggle favorite"
          >
            <svg
              className={`w-4 h-4 transition-transform active:scale-125 ${
                song.is_favorite ? 'fill-amber-400 text-amber-400' : 'fill-transparent stroke-current'
              }`}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {/* Title & Key */}
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors mt-3 line-clamp-1 tracking-tight">
          {song.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
          <span>{song.key_signature}</span>
          <span className="text-zinc-600">•</span>
          <span>{song.tempo} BPM</span>
        </p>

        {/* Mini Audio / Piano Roll Waveform Graphic */}
        <div className="mt-4 flex items-end gap-1 h-6 bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800/50">
          {[40, 75, 55, 90, 60, 80, 45, 100, 65, 85, 30, 70, 95, 50, 60, 40].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-zinc-700 group-hover:bg-indigo-500/80 rounded-full transition-colors duration-300"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-5 pt-3.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>{formatTime(song.duration)}</span>
          <span className="text-zinc-600">/</span>
          <span>{song.note_count} notes</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all">
          <span>Practice</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}