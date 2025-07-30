import { Song } from '@/types';

// 音频文件配置 - 管理clips文件夹中的音频文件
export interface AudioClip {
  id: string;
  guessingClip: string; // 猜歌片段文件路径
  revealClip: string;   // 原曲片段文件路径
}

export const audioClips: AudioClip[] = [
  {
    id: 'ershi-er',
    guessingClip: '/clips/猜歌-二十二.mp3',
    revealClip: '/clips/原曲片段-二十二.mp3'
  },
  {
    id: 'qing-tian',
    guessingClip: '/clips/猜歌-晴天.mp3',
    revealClip: '/clips/原曲片段-晴天.mp3'
  },
  {
    id: 'li-bie-kai-chu-hua',
    guessingClip: '/clips/猜歌-离别开出花.mp3',
    revealClip: '/clips/原曲片段-离别开出花.mp3'
  },
  {
    id: 'super-star',
    guessingClip: '/clips/猜歌-Super Star.mp3',
    revealClip: '/clips/原曲片段-Super Star.mp3'
  }
];

// 获取音频片段配置
export const getAudioClip = (songId: string): AudioClip | undefined => {
  return audioClips.find(clip => clip.id === songId);
};

// 真实音频歌曲数据（替换之前的mock数据）
export const realAudioSongs: Song[] = [
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
  }
];