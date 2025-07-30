import { Song, Playlist } from '@/types';
import { realAudioSongs } from './audioConfig';

// Mock 歌曲数据
export const mockSongs: Song[] = [
  {
    id: '1',
    title: '千里之外',
    artist: '周杰伦 & 费玉清',
    album: '依然范特西',
    coverUrl: '/covers/qianlizhiwai.jpg',
    duration: 248,
    genre: ['华语流行', '民谣'],
    year: 2006,
    language: 'zh',
    clipUrl: '/audio/clips/qianlizhiwai-clip.mp3',
    clipStartTime: 15,
    clipDuration: 20
  },
  {
    id: '2',
    title: '青花瓷',
    artist: '周杰伦',
    album: '我很忙',
    coverUrl: '/covers/qinghuaci.jpg',
    duration: 235,
    genre: ['华语流行', '中国风'],
    year: 2007,
    language: 'zh',
    clipUrl: '/audio/clips/qinghuaci-clip.mp3',
    clipStartTime: 22,
    clipDuration: 18
  },
  {
    id: '3',
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    coverUrl: '/covers/daoxiang.jpg',
    duration: 223,
    genre: ['华语流行'],
    year: 2008,
    language: 'zh',
    clipUrl: '/audio/clips/daoxiang-clip.mp3',
    clipStartTime: 30,
    clipDuration: 25
  },
  {
    id: '4',
    title: '七里香',
    artist: '周杰伦',
    album: '七里香',
    coverUrl: '/covers/qilixiang.jpg',
    duration: 239,
    genre: ['华语流行'],
    year: 2004,
    language: 'zh',
    clipUrl: '/audio/clips/qilixiang-clip.mp3',
    clipStartTime: 18,
    clipDuration: 22
  },
  {
    id: '5',
    title: '夜曲',
    artist: '周杰伦',
    album: '十一月的萧邦',
    coverUrl: '/covers/yequ.jpg',
    duration: 237,
    genre: ['华语流行', 'R&B'],
    year: 2005,
    language: 'zh',
    clipUrl: '/audio/clips/yequ-clip.mp3',
    clipStartTime: 25,
    clipDuration: 20
  },
  {
    id: '6',
    title: '听妈妈的话',
    artist: '周杰伦',
    album: '依然范特西',
    coverUrl: '/covers/tingmamahua.jpg',
    duration: 197,
    genre: ['华语流行'],
    year: 2006,
    language: 'zh',
    clipUrl: '/audio/clips/tingmamahua-clip.mp3',
    clipStartTime: 12,
    clipDuration: 18
  },
  {
    id: '7',
    title: '突然好想你',
    artist: '五月天',
    album: '后青春期的诗',
    coverUrl: '/covers/turanhaoxiangni.jpg',
    duration: 267,
    genre: ['华语摇滚', '流行'],
    year: 2008,
    language: 'zh',
    clipUrl: '/audio/clips/turanhaoxiangni-clip.mp3',
    clipStartTime: 35,
    clipDuration: 22
  },
  {
    id: '8',
    title: '倔强',
    artist: '五月天',
    album: '神的孩子都在跳舞',
    coverUrl: '/covers/juejiang.jpg',
    duration: 226,
    genre: ['华语摇滚'],
    year: 2004,
    language: 'zh',
    clipUrl: '/audio/clips/juejiang-clip.mp3',
    clipStartTime: 28,
    clipDuration: 25
  },
  {
    id: '9',
    title: '追梦赤子心',
    artist: 'GALA',
    album: '追梦赤子心',
    coverUrl: '/covers/zhuimengchizixin.jpg',
    duration: 243,
    genre: ['华语摇滚', '励志'],
    year: 2011,
    language: 'zh',
    clipUrl: '/audio/clips/zhuimengchizixin-clip.mp3',
    clipStartTime: 42,
    clipDuration: 20
  },
  {
    id: '10',
    title: '小幸运',
    artist: '田馥甄',
    album: '我要我们在一起',
    coverUrl: '/covers/xiaoxingyun.jpg',
    duration: 275,
    genre: ['华语流行', '电影原声'],
    year: 2015,
    language: 'zh',
    clipUrl: '/audio/clips/xiaoxingyun-clip.mp3',
    clipStartTime: 20,
    clipDuration: 23
  }
];

// Mock 歌单数据
export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-demo',
    name: '精选试听专辑',
    description: '精心挑选的高品质音频试听歌曲，体验最佳猜歌效果',
    coverUrl: '/covers/精选试听专辑.jpg',
    songs: realAudioSongs,
    category: 'official',
    tags: ['试听', '精选', '高品质']
  },
  {
    id: 'playlist-1',
    name: '80后集体回忆',
    description: '那些年我们一起听过的经典歌曲',
    coverUrl: '/covers/80后集体回忆.jpg',
    songs: mockSongs.slice(0, 5),
    category: 'official',
    tags: ['怀旧', '经典', '80后']
  },
  {
    id: 'playlist-2',
    name: '90后KTV必点',
    description: 'KTV包房里必不可少的热门单曲',
    coverUrl: '/covers/90后KTV必点.jpg',
    songs: mockSongs.slice(2, 7),
    category: 'official',
    tags: ['KTV', '热门', '90后']
  },
  {
    id: 'playlist-3',
    name: '华语新生代',
    description: '新一代华语歌手的代表作品',
    coverUrl: '/covers/华语新生代.jpg',
    songs: mockSongs.slice(5, 10),
    category: 'official',
    tags: ['新生代', '流行', '华语']
  },
  {
    id: 'playlist-4',
    name: '影视金曲',
    description: '来自电影电视剧的经典音乐',
    coverUrl: '/covers/影视金曲.jpg',
    songs: [mockSongs[9], mockSongs[3], mockSongs[1]],
    category: 'official',
    tags: ['影视', '原声', '经典']
  },
  {
    id: 'playlist-5',
    name: '摇滚青春',
    description: '燃烧青春的摇滚旋律',
    coverUrl: '/covers/摇滚青春.jpg',
    songs: [mockSongs[6], mockSongs[7], mockSongs[8]],
    category: 'official',
    tags: ['摇滚', '青春', '励志']
  }
];

// 获取随机歌曲（用于扭蛋模式）- 优先使用真实音频歌曲
export const getRandomSong = (): Song => {
    // 总是优先使用真实音频歌曲（demo 数据）
  if (realAudioSongs.length > 0) {
    const randomIndex = Math.floor(Math.random() * realAudioSongs.length);
    return realAudioSongs[randomIndex];
  }
  // 若无真实歌曲，则退回 mock
  const randomIndex = Math.floor(Math.random() * mockSongs.length);
  return mockSongs[randomIndex];
};

// 根据ID获取歌曲 - 同时搜索真实音频和mock歌曲
export const getSongById = (id: string): Song | undefined => {
  const realSong = realAudioSongs.find(song => song.id === id);
  if (realSong) return realSong;
  return mockSongs.find(song => song.id === id);
};

// 获取所有歌曲（包括真实音频和mock歌曲）
export const getAllSongs = (): Song[] => {
  return [...realAudioSongs, ...mockSongs];
};

// 根据ID获取歌单
export const getPlaylistById = (id: string): Playlist | undefined => {
  return mockPlaylists.find(playlist => playlist.id === id);
};