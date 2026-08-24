// This domain model defines the metadata associated with each uploaded transcription and its
// corresponding practice history, creating a clear structure for downstream UI logic.
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// A song record represents a user-submitted MIDI file and the learner-facing data used to organize,
// classify, and monitor progress across the catalogue.
export interface Song {
  id: string;
  title: string;
  file_path: string;
  duration: number;
  tempo: number;
  note_count: number;
  difficulty: Difficulty | null;
  key_signature: string;
  is_favorite: boolean;
  accuracy_rate: number;
  last_practiced_at: string | null;
  practice_count: number;
  tags: string[];
  created_at: string;
}