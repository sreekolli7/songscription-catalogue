'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Song } from '@/types/song';
import MidiUploader from '@/components/MidiUploader';
import SongCard from '@/components/SongCard';
import PracticeDrawer from '@/components/PracticeDrawer';

export default function CataloguePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'duration' | 'tempo'>('newest');

  const fetchSongs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSongs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleUploadSuccess = (newSong: Song) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  const handleToggleFavorite = async (id: string, current: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !current;
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, is_favorite: updated } : s)));

    await supabase
      .from('songs')
      .update({ is_favorite: updated })
      .eq('id', id);
  };

  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiff = difficultyFilter === 'All' || song.difficulty === difficultyFilter;
        const matchesFav = !onlyFavorites || song.is_favorite;
        return matchesSearch && matchesDiff && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return b.duration - a.duration;
        if (sortBy === 'tempo') return b.tempo - a.tempo;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [songs, searchQuery, difficultyFilter, onlyFavorites, sortBy]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-600/30">
              S
            </div>
            <span className="font-bold tracking-tight text-white text-lg">Songscription</span>
            <span className="text-[11px] font-medium bg-zinc-800/80 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/50">
              Catalogue
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline-block">
              {songs.length} {songs.length === 1 ? 'track' : 'tracks'} stored
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
        
        {/* Hero Section & Upload Area */}
        <section className="space-y-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Transcribed Pieces
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Every piano arrangement transcribed by AI or uploaded directly. Select any track to configure your practice session.
            </p>
          </div>
          <MidiUploader onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Filter & Search Bar */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-3 bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-800/80">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <svg
              className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800/90 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800/90 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Recently Transcribed</option>
              <option value="duration">Longest Duration</option>
              <option value="tempo">Fastest Tempo</option>
            </select>

            {/* Favorites Filter */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                onlyFavorites
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-950 border-zinc-800/90 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>★</span>
              <span>Favorites</span>
            </button>
          </div>
        </section>

        {/* Songs Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/10">
              <p className="text-sm font-semibold text-zinc-300">No transcriptions match your criteria</p>
              <p className="text-xs text-zinc-500 mt-1">
                {songs.length === 0
                  ? 'Upload your first .mid file above to start your catalogue.'
                  : 'Try clearing your search query or toggling filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={setSelectedSong}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

        {/* Practice Slide-over Drawer */}
        <PracticeDrawer song={selectedSong} onClose={() => setSelectedSong(null)} />

      </div>
    </main>
  );
}