import { NextRequest, NextResponse } from 'next/server';
import { Midi } from '@tonejs/midi';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Validate the incoming multipart payload before any downstream processing begins.
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
    // Store the source MIDI in object storage so the file remains accessible while the database keeps metadata.
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

    // Insert into DB
    const { data: newSong, error: dbError } = await supabase
      .from('songs')
      .insert([
        {
          title,
          file_path: storagePath,
          duration,
          tempo,
          note_count: noteCount,
          difficulty: null, // Difficulty will be set by the user later.Defaulting to null for now
          key_signature: keySignature,
          is_favorite: false,
          accuracy_rate: Math.floor(Math.random() * 40) + 60, // Mock initial score
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