// 歌曲类型定义
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // 歌曲总时长（秒）
  genre: string[];
  year: number;
  language: 'zh' | 'en' | 'jp' | 'ko' | 'other';
  clipUrl?: string; // 生成的片段URL
  clipStartTime?: number; // 片段开始时间
  clipDuration?: number; // 片段长度
}

// 歌单类型定义
export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
  category: 'official' | 'user';
  tags: string[];
}

// 游戏模式类型
export type GameMode = 'host' | 'gacha';

// 游戏状态
export interface GameState {
  mode: GameMode;
  currentSong?: Song;
  currentPlaylist?: Playlist;
  isPlaying: boolean;
  showAnswer: boolean;
  queue: Song[];
  currentIndex: number;
}

// 房间状态（用于多人同步）
export interface RoomState {
  id: string;
  gameState: GameState;
  participants: string[];
  isActive: boolean;
}