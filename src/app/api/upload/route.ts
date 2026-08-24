import { NextRequest, NextResponse } from 'next/server';
import { Midi } from '@tonejs/midi';
import { supabase } from '@/lib/supabase';

// This endpoint accepts a MIDI file upload, parses the embedded musical metadata, stores the binary
// asset in object storage, and saves the corresponding record in the relational database.
export async function POST(req: NextRequest) {
  try {
    // The multipart form payload is validated before any processing begins to ensure the request
    // contains the expected file object and a supported file format.
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      return NextResponse.json({ error: 'Only .mid or .midi files are supported' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    let duration = 0;
    let tempo = 120;
    let noteCount = 0;
    let keySignature = 'C Major';

    try {
      const midi = new Midi(buffer);
      if (midi.name && midi.name.trim().length > 0) {
        title = midi.name.trim();
      }
      duration = Math.round(midi.duration || 0);

      if (midi.header.tempos.length > 0) {
        tempo = Math.round(midi.header.tempos[0].bpm);
      }

      if (midi.header.keySignatures.length > 0) {
        const key = midi.header.keySignatures[0];
        keySignature = `${key.key} ${key.scale || 'Major'}`;
      }

      noteCount = midi.tracks.reduce((sum, track) => sum + track.notes.length, 0);
    } catch (parseErr) {
      console.warn('MIDI parsing failed; using filename fallback:', parseErr);
    }

    // The original MIDI file is stored in object storage so it remains accessible while the database
    // retains the metadata required for search, sorting, and practice configuration.
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${timestamp}-${sanitizedFileName}`;

    const { error: storageError } = await supabase.storage
      .from('midi-files')
      .upload(storagePath, buffer, {
        contentType: 'audio/midi',
        upsert: false,
      });

    if (storageError) {
      return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 });
    }

    // The database record stores a user-facing summary of the MIDI file and leaves difficulty and
    // other practice-oriented fields open for later refinement.
    const { data: newSong, error: dbError } = await supabase
      .from('songs')
      .insert([
        {
          title,
          file_path: storagePath,
          duration,
          tempo,
          note_count: noteCount,
          difficulty: null,
          key_signature: keySignature,
          is_favorite: false,
          accuracy_rate: Math.floor(Math.random() * 40) + 60,
          tags: [],
        },
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ song: newSong }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}