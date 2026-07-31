/**
 * musicStore.test.ts — Unit tests for AURA music store
 * Tests queue management, track filtering, and state transitions.
 * Run with: npx vitest run
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMusicStore } from '../store/musicStore';

// Mock MongoDB / fetch dependencies used by the store
vi.mock('../lib/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue({ db: null }),
}));

const mockTrack = (id: string, overrides = {}) => ({
  id,
  title: `Track ${id}`,
  artist: 'Test Artist',
  album: 'Test Album',
  coverUrl: 'https://example.com/cover.jpg',
  audioUrl: 'https://example.com/audio.mp3',
  duration: '3:30',
  region: 'Kollywood',
  ...overrides,
});

describe('musicStore — queue management', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMusicStore.setState({
      tracks: [],
      queue: [],
      currentTrack: null,
      playbackState: 'idle',
    });
  });

  it('setQueue replaces the current queue', () => {
    const tracks = [mockTrack('1'), mockTrack('2'), mockTrack('3')];
    useMusicStore.getState().setQueue(tracks);
    expect(useMusicStore.getState().queue).toHaveLength(3);
    expect(useMusicStore.getState().queue[0].id).toBe('1');
  });

  it('setCurrentTrack updates the playing track', () => {
    const track = mockTrack('42');
    useMusicStore.getState().setCurrentTrack(track);
    expect(useMusicStore.getState().currentTrack?.id).toBe('42');
  });

  it('setPlaybackState transitions correctly', () => {
    useMusicStore.getState().setPlaybackState('playing');
    expect(useMusicStore.getState().playbackState).toBe('playing');
    useMusicStore.getState().setPlaybackState('paused');
    expect(useMusicStore.getState().playbackState).toBe('paused');
  });
});

describe('musicStore — library management', () => {
  beforeEach(() => {
    useMusicStore.setState({ tracks: [] });
  });

  it('addTracksToLibrary deduplicates by id', () => {
    const t1 = mockTrack('a');
    const t2 = mockTrack('b');
    useMusicStore.getState().addTracksToLibrary([t1, t2]);
    useMusicStore.getState().addTracksToLibrary([t2, mockTrack('c')]);
    const ids = useMusicStore.getState().tracks.map(t => t.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
    expect(ids.filter(id => id === 'b')).toHaveLength(1); // no duplicates
  });
});

describe('musicStore — playlist management', () => {
  beforeEach(() => {
    useMusicStore.setState({ playlists: [] });
  });

  it('createPlaylist adds a new playlist', () => {
    useMusicStore.getState().createPlaylist('My Playlist');
    const playlists = useMusicStore.getState().playlists;
    expect(playlists).toHaveLength(1);
    expect(playlists[0].name).toBe('My Playlist');
    expect(playlists[0].trackIds).toHaveLength(0);
  });

  it('addTrackToPlaylist adds trackId to correct playlist', () => {
    useMusicStore.getState().createPlaylist('Chill Mix');
    useMusicStore.getState().addTrackToPlaylist('Chill Mix', 'track-99');
    const playlist = useMusicStore.getState().playlists.find(p => p.name === 'Chill Mix');
    expect(playlist?.trackIds).toContain('track-99');
  });

  it('deletePlaylist removes the playlist', () => {
    useMusicStore.getState().createPlaylist('To Delete');
    expect(useMusicStore.getState().playlists).toHaveLength(1);
    useMusicStore.getState().deletePlaylist('To Delete');
    expect(useMusicStore.getState().playlists).toHaveLength(0);
  });
});

describe('musicStore — album loading state', () => {
  it('albumLoading and albumError have correct initial values', () => {
    const state = useMusicStore.getState();
    expect(state.albumLoading).toBe(false);
    expect(state.albumError).toBeNull();
  });
});
