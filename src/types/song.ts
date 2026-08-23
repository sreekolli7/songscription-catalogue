// This domain model captures the metadata associated with each uploaded transcription and practice session.
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// A song entry represents a user-transcribed MIDI file and the learner-facing data used to organize it.
export interface Song {
  id: string;
  title: string;
  file_path: string;
  duration: number;
  tempo: number;
  note_count: number;
  difficulty: Difficulty | null; // Difficulty is null will be set by the user later.
  key_signature: string;
  is_favorite: boolean;
  accuracy_rate: number;
  last_practiced_at: string | null;
  practice_count: number;
  tags: string[];
  created_at: string;
}