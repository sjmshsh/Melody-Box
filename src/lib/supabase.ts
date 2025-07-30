import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqbqaplufruogrkhvtgf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYnFhcGx1ZnJ1b2dya2h2dGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODUwNzgsImV4cCI6MjA2OTQ2MTA3OH0.2cuoGE3KxNmAS3PAGAg7pdgxNyDipGGGeH4BjaTAHB0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export interface DatabaseRoom {
  id: string;
  room_code: string;
  host_id: string;
  current_song_id?: string;
  current_round: number;
  max_rounds: number;
  game_state: 'waiting' | 'playing' | 'revealed' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface DatabasePlayer {
  id: string;
  room_id: string;
  player_name: string;
  score: number;
  is_host: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface DatabaseGameEvent {
  id: string;
  room_id: string;
  event_type: 'song_start' | 'song_end' | 'answer_reveal' | 'round_end' | 'game_end';
  event_data: Record<string, unknown>;
  created_at: string;
}