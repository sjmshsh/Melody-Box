'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Lightbulb, SkipForward, ArrowLeft, Volume2, Crown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Song } from '@/types';
import { getAudioClip } from '@/data/audioConfig';

export default function HostPlayPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [gameQueue, setGameQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  const currentSong = gameQueue[currentIndex];

  // 加载游戏队列
  useEffect(() => {
    const savedQueue = localStorage.getItem('gameQueue');
    if (savedQueue) {
      setGameQueue(JSON.parse(savedQueue));
    } else {
      router.push('/host');
    }
  }, [router]);

  // 音频进度更新
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const duration = currentSong?.clipDuration || audio.duration || 0;
      const currentTime = audio.currentTime || 0;
      setProgress((currentTime / duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [currentSong]);

  // 模拟音频可视化
  useEffect(() => {
    if (!isPlaying) {
      setAudioLevels(new Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => Math.random() * 100)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);


  // 播放/暂停
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // 使用真实的音频文件
      const audioClip = getAudioClip(currentSong.id);
      const audioSrc = showAnswer 
        ? (audioClip?.revealClip || currentSong.clipUrl)
        : (audioClip?.guessingClip || currentSong.clipUrl);
      
      if (audioSrc) {
        audio.src = audioSrc;
        audio.play().catch((error) => {
          console.log('Audio playback failed:', error);
          // 仍然允许UI交互，即使音频加载失败
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  // 重播当前片段
  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      togglePlay();
    }
  };

  // 揭晓答案
  const revealAnswer = () => {
    setShowAnswer(true);
    setIsPlaying(false);
    
    // 切换到原曲片段
    setTimeout(() => {
      const audio = audioRef.current;
      if (audio && currentSong) {
        const audioClip = getAudioClip(currentSong.id);
        const revealAudioSrc = audioClip?.revealClip || currentSong.clipUrl;
        
        if (revealAudioSrc) {
          audio.src = revealAudioSrc;
          audio.play().catch((error) => {
            console.log('Reveal audio playback failed:', error);
          });
          setIsPlaying(true);
        }
      }
    }, 500);
  };

  // 下一首
  const nextSong = () => {
    if (currentIndex < gameQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setIsPlaying(false);
      setProgress(0);
    } else {
      // 游戏结束，回到首页
      router.push('/');
    }
  };

  // 退出游戏
  const exitGame = () => {
    setIsPlaying(false);
    router.push('/');
  };

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 浮动的音符装饰 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-200 text-6xl opacity-20"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          >
            ♪
          </motion.div>
        ))}
      </div>

      {/* 音频元素 */}
      <audio ref={audioRef} />

      {/* 顶部导航 */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={exitGame}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <Crown className="text-amber-500" size={24} />
                <h1 className="text-xl font-semibold">猜歌进行中</h1>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                第 {currentIndex + 1} 首 / 共 {gameQueue.length} 首
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 主持人控制按钮 */}
              <motion.button
                onClick={togglePlay}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? '暂停' : '播放'}
              </motion.button>
              
              <motion.button
                onClick={replay}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={18} />
                重播
              </motion.button>
              
              {!showAnswer && (
                <motion.button
                  onClick={revealAnswer}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-full text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lightbulb size={18} />
                  揭晓答案
                </motion.button>
              )}
              
              <motion.button
                onClick={nextSong}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipForward size={18} />
                下一首
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 主播放区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            // 播放状态 - 卡片风格
            <motion.div
              key="playing"
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-8">猜猜这是什么歌？</h2>
              
              {/* 音频可视化 */}
              <div className="flex items-end justify-center gap-2 mb-8 h-32 bg-gradient-to-t from-amber-50 to-transparent rounded-xl p-4">
                {audioLevels.map((level, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-t from-amber-500 to-orange-400 rounded-full"
                    style={{
                      width: '8px',
                      height: `${Math.max(8, level)}%`,
                      opacity: isPlaying ? 0.8 : 0.3,
                    }}
                    animate={{
                      height: isPlaying ? `${Math.max(8, level)}%` : '8px',
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>

              {/* 播放进度 */}
              <div className="w-80 mx-auto mb-8">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>播放进度</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              <div className="text-gray-600 text-lg">
                {isPlaying ? '🎵 正在播放猜歌片段...' : '点击上方播放按钮开始猜歌'}
              </div>
              
              {/* 提示信息 */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-700">
                  💡 听到熟悉的旋律了吗？点击&ldquo;揭晓答案&rdquo;查看正确答案
                </p>
              </div>
            </motion.div>
          ) : (
            // 答案揭晓 - 卡片风格
            <motion.div
              key="answer"
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-green-600 text-lg font-medium mb-4">🎉 答案揭晓</div>
              
              {/* 专辑封面 */}
              <motion.div
                className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Image
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </motion.div>

              {/* 歌曲信息 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {currentSong.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {currentSong.artist}
                </p>
                
                {/* 歌曲详细信息 */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">专辑</div>
                    <div className="font-medium">{currentSong.album}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">年份</div>
                    <div className="font-medium">{currentSong.year}</div>
                  </div>
                </div>
                
                {/* 类型标签 */}
                <div className="flex justify-center gap-2 mb-6">
                  {currentSong.genre.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* 音乐波形动画 */}
              <motion.div
                className="flex items-center justify-center gap-1 p-4 bg-green-50 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Volume2 className="text-green-600 mr-2" size={20} />
                <span className="text-green-700 text-sm mr-3">正在播放完整版</span>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-400 rounded-full"
                    animate={{
                      height: [8, 16, 12, 20, 10, 14, 8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}