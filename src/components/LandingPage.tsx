'use client';

import { motion } from 'framer-motion';
import { Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleModeSelect = (mode: 'host' | 'gacha') => {
    router.push(`/${mode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
      {/* 背景装饰 - 浮动音符 */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-200 opacity-30"
            style={{
              fontSize: `${20 + (i % 4) * 10}px`,
              left: `${5 + (i * 8)}%`,
              top: `${10 + (i * 7)}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-15, 15, -15],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          >
            {['♪', '♫', '♬', '♩'][i % 4]}
          </motion.div>
        ))}

        {/* 装饰圆圈 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute border border-amber-200/20 rounded-full"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* 主卡片容器 */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo 和标题 */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            >
              Melody Box
            </motion.h1>
            <motion.h2
              className="text-2xl md:text-3xl text-amber-600 font-medium mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              旋律盲盒
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-600 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              开启一首歌，邂逅一段回忆
            </motion.p>
          </motion.div>

          {/* 模式选择按钮 */}
          <motion.div
            className="flex flex-col md:flex-row gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {/* 主持人模式按钮 */}
            <motion.button
              onClick={() => handleModeSelect('host')}
              className="group relative bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl px-8 py-6 min-w-[250px] hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-full"
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Crown size={28} className="text-white" />
                </motion.div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-1">主持人模式</h3>
                  <p className="text-sm text-white/90">精心策划，引导全场</p>
                </div>
              </div>
            </motion.button>

            {/* 扭蛋模式按钮 */}
            <motion.button
              onClick={() => handleModeSelect('gacha')}
              className="group relative bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl px-8 py-6 min-w-[250px] hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-full"
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap size={28} className="text-white" />
                </motion.div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-1">扭蛋模式</h3>
                  <p className="text-sm text-white/90">随机惊喜，轻松同乐</p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* 特色说明 */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span>
              <span>无压力氛围</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>高品质音源</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-purple-500">✓</span>
              <span>智能片段识别</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 底部信息 */}
        <motion.div
          className="mt-8 text-center text-gray-500 text-sm space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <div>Made with ❤️ for music lovers everywhere</div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span>xxx音乐练习生X计划</span>
            <span>&</span>
            <span>封培5班2组</span>
          </div>
          <div className="text-xs text-gray-400">Melody Box v1.0</div>
        </motion.div>
      </div>
    </div>
  );
}