import { Song } from '@/types';

// 音频文件配置 - 管理clips文件夹中的音频文件
export interface AudioClip {
  id: string;
  guessingClip: string; // 猜歌片段文件路径
  revealClip: string;   // 原曲片段文件路径
}

export const audioClips: AudioClip[] = [
  {
    id: 'li-bie-kai-chu-hua',
    guessingClip: '/clips/猜歌-离别开出花.mp3',
    revealClip: '/clips/原曲片段-离别开出花.mp3'
  },
  {
    id: 'ye-qu',
    guessingClip: '/clips/猜歌-夜曲.mp3',
    revealClip: '/clips/原曲片段-夜曲.mp3'
  },
  {
    id: 'pu-tong-peng-you',
    guessingClip: '/clips/猜歌-普通朋友.mp3',
    revealClip: '/clips/原曲片段-普通朋友.mp3'
  },
  {
    id: 'ershi-er',
    guessingClip: '/clips/猜歌-二十二.mp3',
    revealClip: '/clips/原曲片段-二十二.mp3'
  },
  {
    id: 'tiao-lou-ji',
    guessingClip: '/clips/猜歌-跳楼机.mp3',
    revealClip: '/clips/原曲片段-跳楼机.mp3'
  },
  {
    id: 'yellow',
    guessingClip: '/clips/猜歌-Yellow.mp3',
    revealClip: '/clips/原曲片段-Yellow.mp3'
  },
  {
    id: 'qing-tian',
    guessingClip: '/clips/猜歌-晴天.mp3',
    revealClip: '/clips/原曲片段-晴天.mp3'
  },
  {
    id: 'yi-lu-sheng-hua',
    guessingClip: '/clips/猜歌-一路生花.mp3',
    revealClip: '/clips/原曲片段-一路生花.mp3'
  },
  {
    id: 'super-star',
    guessingClip: '/clips/猜歌-Super Star.mp3',
    revealClip: '/clips/原曲片段-Super Star.mp3'
  },
  {
    id: 'shape-of-you',
    guessingClip: '/clips/猜歌-Shape of You.mp3',
    revealClip: '/clips/原曲片段-Shape of You.mp3'
  },
  {
    id: 'love-story',
    guessingClip: '/clips/猜歌-Love Story.mp3',
    revealClip: '/clips/原曲片段-Love Story.mp3'
  },
  {
    id: 'zhu-yu',
    guessingClip: '/clips/猜歌-珠玉.mp3',
    revealClip: '/clips/原曲片段-珠玉.mp3'
  },
  {
    id: 'deadman',
    guessingClip: '/clips/猜歌-Deadman.mp3',
    revealClip: '/clips/原曲片段-Deadman.mp3'
  }
];

// 获取音频片段配置
export const getAudioClip = (songId: string): AudioClip | undefined => {
  return audioClips.find(clip => clip.id === songId);
};

// 真实音频歌曲数据（替换之前的mock数据）
export const realAudioSongs: Song[] = [
  {
    id: 'li-bie-kai-chu-hua',
    title: '离别开出花',
    artist: '就是南方凯',
    album: '离别开出花',
    coverUrl: '/clips/json_data/img/离别开出花.png',
    duration: 212,
    genre: ['华语', '流行'],
    year: 2023,
    language: 'zh',
    clipUrl: '/clips/猜歌-离别开出花.mp3',
    clipStartTime: 0,
    clipDuration: 39
  },
  {
    id: 'ye-qu',
    title: '夜曲',
    artist: '周杰伦',
    album: '11月的肖邦',
    coverUrl: '/clips/json_data/img/夜曲.png',
    duration: 237,
    genre: ['流行'],
    year: 2005,
    language: 'zh',
    clipUrl: '/clips/猜歌-夜曲.mp3',
    clipStartTime: 0,
    clipDuration: 45
  },
  {
    id: 'pu-tong-peng-you',
    title: '普通朋友',
    artist: '陶喆',
    album: 'I\'m OK',
    coverUrl: '/clips/json_data/img/普通朋友.jpg',
    duration: 240,
    genre: ['流行', 'R&B'],
    year: 1999,
    language: 'zh',
    clipUrl: '/clips/猜歌-普通朋友.mp3',
    clipStartTime: 0,
    clipDuration: 19
  },
  {
    id: 'ershi-er',
    title: '二十二',
    artist: '陶喆',
    album: '黑色柳丁',
    coverUrl: '/clips/json_data/img/黑色柳丁.png',
    duration: 245,
    genre: ['华语', '流行'],
    year: 2002,
    language: 'zh',
    clipUrl: '/clips/猜歌-二十二.mp3',
    clipStartTime: 0,
    clipDuration: 43
  },
  {
    id: 'tiao-lou-ji',
    title: '跳楼机',
    artist: 'LBI利比（时柏尘）',
    album: '跳楼机',
    coverUrl: '/clips/json_data/img/跳楼机.jpg',
    duration: 195,
    genre: ['流行'],
    year: 2024,
    language: 'zh',
    clipUrl: '/clips/猜歌-跳楼机.mp3',
    clipStartTime: 0,
    clipDuration: 39
  },
  {
    id: 'yellow',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Yellow',
    coverUrl: '/clips/json_data/img/YELLOW.png',
    duration: 269,
    genre: ['民谣'],
    year: 2000,
    language: 'en',
    clipUrl: '/clips/猜歌-Yellow.mp3',
    clipStartTime: 0,
    clipDuration: 34
  },
  {
    id: 'qing-tian',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    coverUrl: '/clips/json_data/img/叶惠美.png',
    duration: 268,
    genre: ['华语', '流行'],
    year: 2003,
    language: 'zh',
    clipUrl: '/clips/猜歌-晴天.mp3',
    clipStartTime: 0,
    clipDuration: 28
  },
  {
    id: 'yi-lu-sheng-hua',
    title: '一路生花',
    artist: '温奕心',
    album: '一路生花',
    coverUrl: '/clips/json_data/img/一路生花.png',
    duration: 210,
    genre: ['流行'],
    year: 2021,
    language: 'zh',
    clipUrl: '/clips/猜歌-一路生花.mp3',
    clipStartTime: 0,
    clipDuration: 42
  },
  {
    id: 'super-star',
    title: 'Super Star',
    artist: 'S.H.E',
    album: 'Super Star',
    coverUrl: '/clips/json_data/img/SuperStar.png',
    duration: 201,
    genre: ['华语', '流行'],
    year: 2003,
    language: 'zh',
    clipUrl: '/clips/猜歌-Super Star.mp3',
    clipStartTime: 0,
    clipDuration: 24
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Shape of You',
    coverUrl: '/clips/json_data/img/ShapeOfYou.png',
    duration: 233,
    genre: ['流行'],
    year: 2017,
    language: 'en',
    clipUrl: '/clips/猜歌-Shape of You.mp3',
    clipStartTime: 0,
    clipDuration: 39
  },
  {
    id: 'love-story',
    title: 'Love Story',
    artist: 'Taylor Swift',
    album: 'Love Story',
    coverUrl: '/clips/json_data/img/LoveStory.png',
    duration: 235,
    genre: ['民谣'],
    year: 2009,
    language: 'en',
    clipUrl: '/clips/猜歌-Love Story.mp3',
    clipStartTime: 0,
    clipDuration: 36
  },
  {
    id: 'zhu-yu',
    title: '珠玉',
    artist: '单依纯',
    album: '珠玉',
    coverUrl: '/clips/json_data/img/珠玉.png',
    duration: 215,
    genre: ['流行'],
    year: 2025,
    language: 'zh',
    clipUrl: '/clips/猜歌-珠玉.mp3',
    clipStartTime: 0,
    clipDuration: 43
  },
  {
    id: 'deadman',
    title: 'Deadman',
    artist: '蔡徐坤',
    album: 'Deadman',
    coverUrl: '/clips/json_data/img/Deadman.png',
    duration: 208,
    genre: ['放克', '灵歌', 'R&B'],
    year: 2025,
    language: 'zh',
    clipUrl: '/clips/猜歌-Deadman.mp3',
    clipStartTime: 0,
    clipDuration: 52
  }
];