'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogIn, Copy, Users, ArrowLeft, Check } from 'lucide-react';
import { gameService } from '@/lib/gameService';

interface RoomSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onCreateRoom: (roomCode: string) => void;
  onJoinRoom: (roomCode: string) => void;
}

export default function RoomSelectModal({ 
  isOpen, 
  onClose, 
  onBack, 
  onCreateRoom, 
  onJoinRoom
}: RoomSelectModalProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'create' | 'join'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [roomStats, setRoomStats] = useState({ activeRooms: 0, maxRooms: 20 });
  const [playerName, setPlayerName] = useState('');

  const canCreateRoom = roomStats.activeRooms < roomStats.maxRooms;

  // 获取房间统计
  useEffect(() => {
    if (isOpen) {
      loadRoomStats();
    }
  }, [isOpen]);

  // 重置状态当模态框打开时
  useEffect(() => {
    if (isOpen) {
      setActiveTab('select');
      setPlayerName('');
      setRoomCode('');
      setError('');
      setCreatedRoomCode('');
    }
  }, [isOpen]);

  const loadRoomStats = async () => {
    const stats = await gameService.getRoomStats();
    setRoomStats(stats);
  };

  const handleCreateRoom = async () => {
    if (!canCreateRoom) {
      setError('当前房间已满，请稍后再试');
      return;
    }
    
    if (!playerName.trim()) {
      setError('请输入您的姓名');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      const result = await gameService.createRoom(playerName.trim());
      
      if (result.success && result.roomCode) {
        setCreatedRoomCode(result.roomCode);
        await loadRoomStats(); // 更新房间统计
      } else {
        setError(result.error || '创建房间失败');
      }
    } catch {
      setError('创建房间时发生错误');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('请输入房间号');
      return;
    }
    
    if (!playerName.trim()) {
      setError('请输入您的姓名');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    try {
      const result = await gameService.joinRoom(roomCode.trim(), playerName.trim());
      
      if (result.success) {
        onJoinRoom(roomCode.trim());
      } else {
        setError(result.error || '加入房间失败');
      }
    } catch {
      setError('加入房间时发生错误');
    } finally {
      setIsJoining(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">联机模式</h2>
              <div className="w-8"></div>
            </div>

            {/* 房间统计 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-600" size={18} />
                  <span className="text-sm font-medium text-purple-700">房间状态</span>
                </div>
                <div className="text-sm text-purple-600">
                  {roomStats.activeRooms}/{roomStats.maxRooms} 房间使用中
                </div>
              </div>
              {!canCreateRoom && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
                  ⚠️ 当前房间已满，请稍后再试或加入现有房间
                </div>
              )}
            </div>

            {createdRoomCode ? (
              // 房间创建成功界面
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">房间创建成功！</h3>
                <p className="text-gray-600 mb-6">您的房间号是：</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-mono font-bold text-purple-600">{createdRoomCode}</span>
                    <button
                      onClick={copyRoomCode}
                      className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="text-green-600" size={16} />
                      ) : (
                        <Copy className="text-purple-600" size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {copied ? '已复制到剪贴板' : '点击复制房间号分享给朋友'}
                  </p>
                </div>

                <button
                  onClick={() => onCreateRoom(createdRoomCode)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  进入房间开始游戏
                </button>
              </motion.div>
            ) : activeTab === 'select' ? (
              // 选择界面
              <div className="space-y-4">
                {/* 创建房间 */}
                <motion.button
                  onClick={() => setActiveTab('create')}
                  disabled={!canCreateRoom}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={canCreateRoom ? { scale: 1.02 } : {}}
                  whileTap={canCreateRoom ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Plus className="text-purple-600" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">创建房间</h3>
                      <p className="text-sm text-gray-600">成为房主，邀请朋友加入</p>
                    </div>
                  </div>
                </motion.button>

                {/* 加入房间 */}
                <motion.button
                  onClick={() => setActiveTab('join')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <LogIn className="text-blue-600" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">加入房间</h3>
                      <p className="text-sm text-gray-600">输入房间号加入朋友的游戏</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            ) : activeTab === 'create' ? (
              // 创建房间界面
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">创建房间</h3>
                  <p className="text-gray-600">请输入您的姓名来创建游戏房间</p>
                </div>

                <div className="space-y-4">
                  {/* 姓名输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      请输入您的姓名
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="例如：小明"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={20}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('select')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={!playerName.trim() || isCreating}
                      className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          创建中...
                        </div>
                      ) : (
                        '创建房间'
                      )}
                    </button>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <motion.div
                      className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              // 加入房间界面
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">加入房间</h3>
                  <p className="text-gray-600">请输入朋友分享的房间号</p>
                </div>

                <div className="space-y-4">
                  {/* 姓名输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      请输入您的姓名
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="例如：小明"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      房间号
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="MUSICXXXXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
                      maxLength={12}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab('select')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim() || !playerName.trim() || isJoining}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isJoining ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          加入中...
                        </div>
                      ) : (
                        '加入房间'
                      )}
                    </button>
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <motion.div
                      className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}