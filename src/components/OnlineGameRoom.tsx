'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Zap, Crown, Users, Trophy, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { Song } from '@/types';
import { getAudioClip } from '@/data/audioConfig';
import { gameService, GameRoom } from '@/lib/gameService';

interface OnlineGameRoomProps {
  roomCode: string;
  onExit: () => void;
}

export default function OnlineGameRoom({ roomCode, onExit }: OnlineGameRoomProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(0));
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  // 随机选择文案
  const getRandomPrompt = useCallback(() => {
    const gamePrompts = [
      '有一个人经常在晚上听这首歌，他是谁',
      '有三个人都喜欢听这位歌手的歌，猜猜是哪三个人',
      '爱听这首歌的人，他的MBTI 是 INFP'
    ];
    const randomIndex = Math.floor(Math.random() * gamePrompts.length);
    return gamePrompts[randomIndex];
  }, []);

  const loadRoomData = useCallback(async () => {
    setLoading(true);
    try {
      const room = await gameService.getRoomInfo(roomCode);
      if (room) {
        setGameRoom(room);
      } else {
        setError('房间不存在或已过期');
      }
    } catch {
      setError('加载房间数据失败');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  // 初始化房间数据和实时订阅
  useEffect(() => {
    setMyPlayerId(gameService.getCurrentPlayerId());
    // 刷新在线状态
    gameService.refreshOnlineStatus();
    // 强制设置所有玩家为在线状态
    gameService.forceAllPlayersOnline(roomCode);
    loadRoomData();
    
    // 订阅房间更新
    const subscription = gameService.subscribeToRoom(roomCode, (room) => {
      console.log('房间状态更新:', room); // 调试日志
      setGameRoom(room);
      setLoading(false);
      
      // 当游戏状态变为playing时，获取当前歌曲并自动播放
      if (room.gameState === 'playing' && room.currentSong) {
        console.log('游戏开始，设置当前歌曲:', room.currentSong);
        setCurrentSong(room.currentSong);
        setAnswer('');
        setSubmittedAnswer(false);
        // 设置随机文案
        setCurrentPrompt(getRandomPrompt());
        
        // 延迟一点时间确保audio元素准备好，然后自动播放
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && room.currentSong) {
            const audioClip = getAudioClip(room.currentSong.id);
            const audioSrc = audioClip?.guessingClip || room.currentSong.clipUrl;
            
            if (audioSrc) {
              console.log('自动播放音频:', audioSrc);
              audio.src = audioSrc;
              audio.play().catch(console.error).then(() => {
                setIsPlaying(true);
                console.log('音频播放成功');
              });
            }
          }
        }, 1000); // 1秒延迟确保DOM更新完成
      }
      
      // 当游戏状态变为waiting时，清理状态
      if (room.gameState === 'waiting') {
        setCurrentSong(null);
        setAnswer('');
        setSubmittedAnswer(false);
        setIsPlaying(false);
      }
    });

    // 页面关闭时退出房间
    const handleBeforeUnload = () => {
      gameService.leaveRoom();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      gameService.leaveRoom();
    };
  }, [roomCode, loadRoomData, getRandomPrompt]);

  // 音频可视化效果
  useEffect(() => {
    if (!isPlaying || !gameRoom || gameRoom.gameState === 'waiting') {
      setAudioLevels(new Array(12).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => Math.random() * 100)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, gameRoom]);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);



  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const startNewRound = async () => {
    // 检查是否为房主
    if (!gameRoom || myPlayerId !== gameRoom.hostId) return;
    
    try {
      console.log('房主开始新一轮游戏');
      const result = await gameService.startNewRound(roomCode);
      if (result.success && result.song) {
        console.log('新一轮开始成功，歌曲:', result.song);
        // 房主也需要设置状态，但音频播放会通过订阅触发
        setCurrentSong(result.song);
        setAnswer('');
        setSubmittedAnswer(false);
        // 设置随机文案
        setCurrentPrompt(getRandomPrompt());
      } else {
        setError(result.error || '开始游戏失败');
      }
    } catch {
      setError('开始游戏时发生错误');
    }
  };

  const revealAnswer = async () => {
    // 检查是否为房主
    if (!gameRoom || myPlayerId !== gameRoom.hostId) return;
    
    try {
      const result = await gameService.revealAnswer(roomCode);
      if (result.success) {
        setIsPlaying(false);
        
        // 切换到原曲片段
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && currentSong) {
            const audioClip = getAudioClip(currentSong.id);
            const revealAudioSrc = audioClip?.revealClip || currentSong.clipUrl;
            
            if (revealAudioSrc) {
              audio.src = revealAudioSrc;
              audio.play().catch(console.error).then(() => setIsPlaying(true));
            }
          }
        }, 500);
      } else {
        setError(result.error || '揭晓答案失败');
      }
    } catch {
      setError('揭晓答案时发生错误');
    }
  };

  const nextRound = async () => {
    // 检查是否为房主
    if (!gameRoom || myPlayerId !== gameRoom.hostId) return;
    
    try {
      const result = await gameService.nextRound(roomCode);
      if (result.success) {
        setIsPlaying(false);
        setCurrentSong(null);
        setAnswer('');
        setSubmittedAnswer(false);
      } else {
        setError(result.error || '进入下一轮失败');
      }
    } catch {
      setError('进入下一轮时发生错误');
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const audioClip = getAudioClip(currentSong.id);
      const audioSrc = gameRoom?.gameState === 'revealed' 
        ? (audioClip?.revealClip || currentSong.clipUrl)
        : (audioClip?.guessingClip || currentSong.clipUrl);
      
      if (audioSrc) {
        audio.src = audioSrc;
        audio.play().catch(console.error);
      }
    }
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载房间数据中...</p>
        </div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">连接失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onExit}
            className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 提交答案
  const submitAnswer = async () => {
    if (!answer.trim() || !currentSong || submittedAnswer) return;
    
    try {
      const result = await gameService.submitAnswer(roomCode, myPlayerId, answer.trim(), currentSong.title);
      if (result.success) {
        setSubmittedAnswer(true);
        if (result.isCorrect) {
          // 答案正确的提示
          console.log('答案正确！');
        }
      }
    } catch (error) {
      console.error('提交答案失败:', error);
    }
  };

  if (!gameRoom) return null;

  const sortedPlayers = [...gameRoom.players].sort((a, b) => b.score - a.score);
  const onlinePlayers = gameRoom.players.filter(p => p.isOnline);
  const isHost = myPlayerId === gameRoom.hostId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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
                onClick={onExit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <Users className="text-purple-500" size={24} />
                <h1 className="text-xl font-semibold">联机模式</h1>
              </div>
            </div>
            
            {/* 房间信息 */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                第 {gameRoom.currentRound} 轮 / 共 {gameRoom.maxRounds} 轮
              </div>
              <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-purple-700">房间号: {roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  className="p-1 hover:bg-purple-200 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <Copy className="text-purple-600" size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：玩家列表 */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">在线玩家</h2>
                <span className="text-sm text-gray-500">
                  {onlinePlayers.length} 人在线
                </span>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {sortedPlayers.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                      transition={{ 
                        delay: index * 0.1,
                        layout: { duration: 0.3 }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="text-yellow-500" size={16} />}
                        {player.isHost && <Crown className="text-amber-500" size={14} />}
                        <div className={`w-3 h-3 rounded-full ${
                          player.isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{player.name}</div>
                        <motion.div 
                          className="text-xs text-gray-500"
                          key={`score-${player.id}-${player.score}`}
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.3 }}
                        >
                          {player.score} 分
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {gameRoom.gameState === 'waiting' && isHost && (
                <motion.button
                  onClick={startNewRound}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap size={18} />
                    开始新一轮
                  </div>
                </motion.button>
              )}
              
              {gameRoom.gameState === 'waiting' && !isHost && (
                <div className="w-full mt-4 bg-gray-100 text-gray-500 py-3 rounded-xl text-center">
                  等待房主开始游戏...
                </div>
              )}
            </motion.div>
          </div>

          {/* 右侧：游戏区域 */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {gameRoom.gameState === 'waiting' && (
                <motion.div
                  key="waiting"
                  className="bg-white rounded-2xl shadow-lg p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-white" size={32} />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    准备开始第 {gameRoom.currentRound} 轮游戏
                  </h2>
                  <p className="text-gray-600 mb-8">
                    房主可以点击&ldquo;开始新一轮&rdquo;按钮开始游戏
                  </p>
                  
                  {/* 游戏规则 */}
                  <div className="bg-purple-50 rounded-xl p-6 text-left">
                    <h3 className="font-medium text-purple-800 mb-3">游戏规则</h3>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>• 听音乐片段，最快猜出歌名的玩家得分最高</li>
                      <li>• 共 {gameRoom.maxRounds} 轮游戏，总分最高者获胜</li>
                      <li>• 房主可以控制游戏进度</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {gameRoom.gameState === 'playing' && currentSong && (
                <motion.div
                  key="playing"
                  className="bg-white rounded-2xl shadow-lg p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {/* 随机文案显示 */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                        {currentPrompt || '准备开始猜歌...'}
                      </h2>
                    </div>
                    {/*<p className="text-sm text-gray-500">*/}
                    {/*  🎵 听音乐，找线索，猜出答案吧！*/}
                    {/*</p>*/}
                  </motion.div>
                  
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

                  {/* 答题输入框 */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-3">猜一猜这首歌是什么？</h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="请输入歌名..."
                        disabled={submittedAnswer}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !submittedAnswer) {
                            submitAnswer();
                          }
                        }}
                      />
                      <button
                        onClick={submitAnswer}
                        disabled={!answer.trim() || submittedAnswer}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittedAnswer ? '已提交' : '提交'}
                      </button>
                    </div>
                    {submittedAnswer && (
                      <p className="text-sm text-green-600 mt-2">✓ 答案已提交，等待揭晓结果</p>
                    )}
                  </div>

                  {/* 游戏控制 */}
                  <div className="flex justify-center gap-4 mt-6">
                    <motion.button
                      onClick={togglePlay}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? '暂停' : '播放'}
                    </motion.button>
                    
                    {isHost && (
                      <motion.button
                        onClick={revealAnswer}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        揭晓答案
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {gameRoom.gameState === 'revealed' && currentSong && (
                <motion.div
                  key="revealed"
                  className="bg-white rounded-2xl shadow-lg p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
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

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {currentSong.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                      {currentSong.artist}
                    </p>
                    
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

                    {isHost && (
                      <motion.button
                        onClick={nextRound}
                        className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {gameRoom.currentRound < gameRoom.maxRounds ? '下一轮' : '查看最终排名'}
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {gameRoom.gameState === 'finished' && (
                <motion.div
                  key="finished"
                  className="bg-white rounded-2xl shadow-lg p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">游戏结束！</h2>
                  
                  {/* 最终排名 */}
                  <div className="space-y-3 mb-8">
                    {sortedPlayers.map((player, index) => (
                      <motion.div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-50'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                          {index === 0 && <Crown className="text-yellow-500" size={20} />}
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{player.score} 分</span>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={onExit}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all"
                  >
                    退出房间
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />
    </div>
  );
}