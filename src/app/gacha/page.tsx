'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Volume2, Zap, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRandomSong } from '@/data/mockSongs';
import { getAudioClip } from '@/data/audioConfig';
import { Song } from '@/types';
import ModeSelectModal from '@/components/ModeSelectModal';
import RoomSelectModal from '@/components/RoomSelectModal';
import OnlineGameRoom from '@/components/OnlineGameRoom';

type GachaState = 'machine' | 'opening' | 'playing' | 'revealed';
type AppState = 'mode-select' | 'room-select' | 'single-game' | 'online-game';

export default function GachaModePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 应用状态管理
  const [appState, setAppState] = useState<AppState>('mode-select');
  const [roomCode, setRoomCode] = useState('');
  
  // 单机游戏状态
  const [gachaState, setGachaState] = useState<GachaState>('machine');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(0));
  const [gachaRotation, setGachaRotation] = useState(0);
  
  // 房间系统数据 (mock) - removed unused variable

  // 音频可视化效果
  useEffect(() => {
    if (!isPlaying || (gachaState !== 'playing' && gachaState !== 'revealed')) {
      setAudioLevels(new Array(12).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => Math.random() * 100)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, gachaState]);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  // 开启扭蛋
  const openGacha = async () => {
    // 旋转动画
    setGachaState('opening');
    setGachaRotation(prev => prev + 360);

    // 模拟扭蛋机动画延迟
    setTimeout(() => {
      const randomSong = getRandomSong();
      setCurrentSong(randomSong);
      setGachaState('playing');
      
      // 自动开始播放
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio && randomSong) {
          const audioClip = getAudioClip(randomSong.id);
          const audioSrc = audioClip?.guessingClip || randomSong.clipUrl;
          
          if (audioSrc) {
            audio.src = audioSrc;
            audio.play().catch((error) => {
              console.log('Auto play failed:', error);
              // 不设置 isPlaying 为 true，让用户手动点击播放
            }).then(() => {
              setIsPlaying(true);
            });
          }
        }
      }, 800);
    }, 2000);
  };

  // 揭晓答案
  const revealAnswer = () => {
    setGachaState('revealed');
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
          }).then(() => {
            setIsPlaying(true);
          });
        }
      }
    }, 500);
  };

  // 手动播放控制
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const audioClip = getAudioClip(currentSong.id);
      const audioSrc = gachaState === 'revealed' 
        ? (audioClip?.revealClip || currentSong.clipUrl)
        : (audioClip?.guessingClip || currentSong.clipUrl);
      
      if (audioSrc) {
        audio.src = audioSrc;
        audio.play().catch((error) => {
          console.log('Manual play failed:', error);
        }).then(() => {
          setIsPlaying(true);
        });
      }
    }
  };

  // 再来一发
  const playAgain = () => {
    setGachaState('machine');
    setCurrentSong(null);
    setIsPlaying(false);
    setGachaRotation(prev => prev + 180);
  };

  // 模式选择处理
  const handleModeSelect = (mode: 'single' | 'online') => {
    if (mode === 'single') {
      setAppState('single-game');
    } else {
      setAppState('room-select');
    }
  };

  // 房间操作处理
  const handleCreateRoom = (code: string) => {
    setRoomCode(code);
    setAppState('online-game');
  };

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setAppState('online-game');
  };

  const handleBackToModeSelect = () => {
    setAppState('mode-select');
  };

  const handleExitOnlineGame = () => {
    setAppState('mode-select');
    setRoomCode('');
  };

  // 如果是在线游戏模式，直接渲染房间组件
  if (appState === 'online-game') {
    return <OnlineGameRoom roomCode={roomCode} onExit={handleExitOnlineGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 浮动的扭蛋 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${
                ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][i % 6]
              }, ${['#ff8e53', '#48cae4', '#6c5ce7', '#a8e6cf', '#fdcb6e', '#fd79a8'][i % 6]})`,
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 9)}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* 顶部导航 */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Zap className="text-pink-500" size={24} />
              <h1 className="text-xl font-semibold">随机模式</h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 主要内容区域 */}
      <div className="flex items-center justify-center min-h-screen p-8 relative z-10">
        <div className="max-w-4xl w-full">
        {appState === 'single-game' && (
          <AnimatePresence mode="wait">
            {gachaState === 'machine' && (
            <motion.div
              key="machine"
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
            >
              {/* 扭蛋机 */}
              <motion.div
                className="relative mx-auto mb-8"
                style={{ width: '300px', height: '400px' }}
                animate={{ rotate: gachaRotation }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                {/* 扭蛋机主体 */}
                <div className="relative w-full h-full">
                  {/* 球形容器 */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-white/20 to-white/5 rounded-full border-4 border-white/30 backdrop-blur-sm">
                    {/* 扭蛋们 */}
                    <div className="absolute inset-4 rounded-full overflow-hidden">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-6 h-6 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${
                              ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][i % 6]
                            }, ${['#ff8e53', '#48cae4', '#6c5ce7', '#a8e6cf', '#fdcb6e', '#fd79a8'][i % 6]})`,
                            left: `${20 + (i % 4) * 25}%`,
                            top: `${20 + Math.floor(i / 4) * 25}%`,
                          }}
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 机身 */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg">
                    {/* 出口 */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-black/50 rounded-lg" />
                  </div>
                </div>
              </motion.div>

              {/* 标题和按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-4">音乐扭蛋机</h2>
                <p className="text-gray-600 text-lg mb-8">摇一摇，看看能遇到什么惊喜？</p>
                
                <motion.button
                  onClick={openGacha}
                  className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-medium hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Zap size={24} />
                    </motion.div>
                    摇一下！
                  </div>
                </motion.button>
                
                {/* 使用说明 */}
                <div className="mt-8 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700">
                    🎲 每次摇蛋都是全新的音乐体验，准备好迎接惊喜了吗？
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gachaState === 'opening' && (
            <motion.div
              key="opening"
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 扭蛋开启动画 */}
              <motion.div
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl"
                animate={{
                  scale: [1, 1.2, 1.5, 0.8, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -180, -360] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                >
                  🎵
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl text-gray-800 mb-4">扭蛋开启中...</h2>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">正在为您挑选一首特别的歌曲...</p>
              </motion.div>
            </motion.div>
          )}

          {(gachaState === 'playing' || gachaState === 'revealed') && currentSong && (
            <motion.div
              key="playing"
              className="bg-white rounded-2xl shadow-lg p-8 text-center w-full max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
            >
              {gachaState === 'playing' ? (
                // 播放状态
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">猜猜这是什么歌？</h2>
                  
                  <motion.div
                    className="w-48 h-48 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl"
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                  >
                    <span className="text-6xl">🎵</span>
                  </motion.div>

                  {/* 音频可视化 */}
                  <div className="flex items-end justify-center gap-2 mb-8 h-20 bg-gradient-to-t from-purple-50 to-transparent rounded-xl p-4">
                    {audioLevels.map((level, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-t from-purple-500 to-pink-400 rounded-full"
                        style={{
                          width: '6px',
                          height: `${Math.max(8, level * 0.6)}%`,
                          opacity: isPlaying ? 0.8 : 0.3,
                        }}
                        animate={{
                          height: isPlaying ? `${Math.max(8, level * 0.6)}%` : '8px',
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>

                  {/* 播放控制 */}
                  <div className="flex justify-center gap-4 mb-6">
                    <motion.button
                      onClick={togglePlay}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? '暂停' : '播放'}
                    </motion.button>
                    
                    <motion.button
                      onClick={revealAnswer}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      猜到了！揭晓答案
                    </motion.button>
                  </div>
                  
                  {/* 提示信息 */}
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-sm text-purple-700">
                      🎧 仔细听，这段旋律是否唤起了你的回忆？
                    </p>
                  </div>
                </>
              ) : (
                // 答案揭晓状态
                <>
                  <div className="text-green-600 text-lg font-medium mb-4">🎉 答案揭晓</div>
                  
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
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* 音乐波形 */}
                    <div className="flex items-center justify-center gap-1 p-4 bg-green-50 rounded-xl mb-6">
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
                    </div>

                    <motion.button
                      onClick={playAgain}
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw size={18} />
                        再来一发！
                      </div>
                    </motion.button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        )}
        </div>
      </div>

      {/* 模态框 */}
      <ModeSelectModal
        isOpen={appState === 'mode-select'}
        onClose={() => router.push('/')}
        onSelectMode={handleModeSelect}
      />

      <RoomSelectModal
        isOpen={appState === 'room-select'}
        onClose={() => router.push('/')}
        onBack={handleBackToModeSelect}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />
    </div>
  );
}