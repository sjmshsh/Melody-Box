import { supabase } from './supabase';
import { Song } from '@/types';
import { getRandomSongForOnline } from '@/data/mockSongs';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isOnline: boolean;
}

export interface GameRoom {
  id: string;
  roomCode: string;
  hostId: string;
  currentSong?: Song;
  currentRound: number;
  maxRounds: number;
  gameState: 'waiting' | 'playing' | 'revealed' | 'finished';
  players: Player[];
}

class GameService {
  private currentPlayerId: string = '';
  private currentRoomId: string = '';

  // 生成玩家ID
  generatePlayerId(): string {
    this.currentPlayerId = 'player_' + Math.random().toString(36).substring(2, 15);
    return this.currentPlayerId;
  }

  // 生成房间号
  generateRoomCode(): string {
    const prefixes = ['MUSIC', 'SONG', 'TUNE', 'BEAT'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${suffix}`;
  }

  // 创建房间
  async createRoom(playerName: string): Promise<{ success: boolean; roomCode?: string; error?: string }> {
    try {
      const playerId = this.generatePlayerId();
      const roomCode = this.generateRoomCode();
      
      // 检查房间号是否已存在
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (existingRoom) {
        // 如果房间号已存在，递归重试
        return this.createRoom(playerName);
      }

      // 创建房间
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          host_id: playerId,
          current_round: 1,
          max_rounds: 3,
          game_state: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // 添加房主为玩家
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          room_id: room.id,
          player_name: playerName,
          score: 0,
          is_host: true,
          is_online: true,
          last_seen: new Date().toISOString()
        });

      if (playerError) throw playerError;

      this.currentRoomId = room.id;
      return { success: true, roomCode };
    } catch (error) {
      console.error('Create room error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 加入房间
  async joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 查找房间
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        return { success: false, error: '房间不存在' };
      }

      // 检查房间是否已满（最多4人）
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)
        .eq('is_online', true);

      if (playersError) throw playersError;

      if (players && players.length >= 4) {
        return { success: false, error: '房间已满' };
      }

      // 生成玩家ID并加入房间
      const playerId = this.generatePlayerId();
      const { error: joinError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          room_id: room.id,
          player_name: playerName,
          score: 0,
          is_host: false,
          is_online: true,
          last_seen: new Date().toISOString()
        });

      if (joinError) throw joinError;

      this.currentRoomId = room.id;
      return { success: true };
    } catch (error) {
      console.error('Join room error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 获取房间信息
  async getRoomInfo(roomCode: string): Promise<GameRoom | null> {
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) return null;

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;

      // 获取当前歌曲信息（如果存在）
      let currentSong = null;
      if (room.current_song_id && room.game_state === 'playing') {
        // 从game_events表中获取当前歌曲信息
        const { data: latestEvent } = await supabase
          .from('game_events')
          .select('event_data')
          .eq('room_id', room.id)
          .eq('event_type', 'song_start')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestEvent && latestEvent.event_data?.song) {
          currentSong = latestEvent.event_data.song;
        }
      }

      const gameRoom: GameRoom = {
        id: room.id,
        roomCode: room.room_code,
        hostId: room.host_id,
        currentSong: currentSong,
        currentRound: room.current_round,
        maxRounds: room.max_rounds,
        gameState: room.game_state,
        players: (players || []).map(p => ({
          id: p.id,
          name: p.player_name,
          score: p.score,
          isHost: p.is_host,
          isOnline: p.is_online
        }))
      };

      return gameRoom;
    } catch (error) {
      console.error('Get room info error:', error);
      return null;
    }
  }

  // 开始新一轮游戏
  async startNewRound(roomCode: string): Promise<{ success: boolean; song?: Song; error?: string }> {
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        return { success: false, error: '房间不存在' };
      }

      const song = getRandomSongForOnline();
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          game_state: 'playing',
          current_song_id: song.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);

      if (updateError) throw updateError;

      // 记录游戏事件，包含完整的歌曲信息
      await supabase
        .from('game_events')
        .insert({
          room_id: room.id,
          event_type: 'song_start',
          event_data: { 
            song: song, 
            round: room.current_round,
            timestamp: new Date().toISOString()
          }
        });

      return { success: true, song };
    } catch (error) {
      console.error('Start new round error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 揭晓答案
  async revealAnswer(roomCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        return { success: false, error: '房间不存在' };
      }

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          game_state: 'revealed',
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);

      if (updateError) throw updateError;

      // 不再自动给玩家加分，分数只通过submitAnswer获得

      // 记录游戏事件
      await supabase
        .from('game_events')
        .insert({
          room_id: room.id,
          event_type: 'answer_reveal',
          event_data: { round: room.current_round }
        });

      return { success: true };
    } catch (error) {
      console.error('Reveal answer error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 下一轮
  async nextRound(roomCode: string): Promise<{ success: boolean; gameFinished?: boolean; error?: string }> {
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !room) {
        return { success: false, error: '房间不存在' };
      }

      const isGameFinished = room.current_round >= room.max_rounds;
      const newGameState = isGameFinished ? 'finished' : 'waiting';
      const newRound = isGameFinished ? room.current_round : room.current_round + 1;

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          current_round: newRound,
          game_state: newGameState,
          current_song_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id);

      if (updateError) throw updateError;

      // 记录游戏事件
      await supabase
        .from('game_events')
        .insert({
          room_id: room.id,
          event_type: isGameFinished ? 'game_end' : 'round_end',
          event_data: { round: room.current_round }
        });

      return { success: true, gameFinished: isGameFinished };
    } catch (error) {
      console.error('Next round error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 退出房间 - 永远保持在线状态
  async leaveRoom(): Promise<void> {
    if (this.currentPlayerId && this.currentRoomId) {
      try {
        // 不再设置为离线，保持在线状态
        await supabase
          .from('players')
          .update({
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentPlayerId);
        
        console.log('玩家更新最后在线时间:', this.currentPlayerId); // 调试日志
      } catch (error) {
        console.error('Update last seen error:', error);
      }
    }
  }

  // 手动刷新在线状态 - 强制设置为在线
  async refreshOnlineStatus(): Promise<void> {
    if (this.currentPlayerId) {
      try {
        await supabase
          .from('players')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentPlayerId);
        console.log('强制设置玩家在线状态:', this.currentPlayerId);
      } catch (error) {
        console.error('Refresh online status error:', error);
      }
    }
  }

  // 强制设置所有玩家为在线状态
  async forceAllPlayersOnline(roomCode: string): Promise<void> {
    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (room) {
        await supabase
          .from('players')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('room_id', room.id);
        console.log('强制设置房间所有玩家为在线状态:', roomCode);
      }
    } catch (error) {
      console.error('Force all players online error:', error);
    }
  }

  // 订阅房间更新
  subscribeToRoom(roomCode: string, callback: (room: GameRoom) => void) {
    return supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
        async (payload) => {
          console.log('房间表更新:', payload); // 调试日志
          const room = await this.getRoomInfo(roomCode);
          if (room) callback(room);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        async (payload) => {
          console.log('玩家表更新:', payload); // 调试日志
          const room = await this.getRoomInfo(roomCode);
          if (room) callback(room);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_events' },
        async (payload) => {
          console.log('游戏事件更新:', payload); // 调试日志
          const room = await this.getRoomInfo(roomCode);
          if (room) callback(room);
        }
      )
      .subscribe();
  }

  // 添加答题功能
  async submitAnswer(roomCode: string, playerId: string, answer: string, correctAnswer: string): Promise<{ success: boolean; isCorrect?: boolean; points?: number; error?: string }> {
    try {
      const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      const points = isCorrect ? 10 : 0;

      if (isCorrect) {
        // 先获取当前分数
        const { data: player, error: getError } = await supabase
          .from('players')
          .select('score')
          .eq('id', playerId)
          .single();

        if (getError) throw getError;

        // 更新玩家分数
        const { error: updateError } = await supabase
          .from('players')
          .update({
            score: (player?.score || 0) + points,
            last_seen: new Date().toISOString()
          })
          .eq('id', playerId);

        if (updateError) throw updateError;
      }

      return { success: true, isCorrect, points };
    } catch (error) {
      console.error('Submit answer error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 获取当前玩家ID
  getCurrentPlayerId(): string {
    return this.currentPlayerId;
  }

  // 获取房间统计
  async getRoomStats(): Promise<{ activeRooms: number; maxRooms: number }> {
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('id')
        .neq('game_state', 'finished')
        .gte('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // 30分钟内活跃

      if (error) throw error;

      return {
        activeRooms: rooms?.length || 0,
        maxRooms: 20 // 设置最大房间数
      };
    } catch (error) {
      console.error('Get room stats error:', error);
      return { activeRooms: 0, maxRooms: 20 };
    }
  }
}

export const gameService = new GameService();