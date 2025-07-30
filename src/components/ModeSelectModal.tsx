'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, X } from 'lucide-react';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'single' | 'online') => void;
}

export default function ModeSelectModal({ isOpen, onClose, onSelectMode }: ModeSelectModalProps) {
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* 标题 */}
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <span className="text-2xl">🎲</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">选择游戏模式</h2>
              <p className="text-gray-600">选择您想要的扭蛋体验</p>
            </div>

            {/* 模式选项 */}
            <div className="space-y-4">
              {/* 单机模式 */}
              <motion.button
                onClick={() => onSelectMode('single')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">单机模式</h3>
                    <p className="text-sm text-gray-600">独自享受音乐猜歌的乐趣</p>
                  </div>
                </div>
              </motion.button>

              {/* 联机模式 */}
              <motion.button
                onClick={() => onSelectMode('online')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">联机模式</h3>
                    <p className="text-sm text-gray-600">与朋友们一起猜歌竞技</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">实时同步</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">积分排行</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* 提示信息 */}
            <motion.div
              className="mt-6 p-4 bg-amber-50 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-amber-700 text-center">
                💡 单机模式可随时开始，联机模式需要创建或加入房间
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}