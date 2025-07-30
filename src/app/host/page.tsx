'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Plus, X, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockPlaylists, getAllSongs } from '@/data/mockSongs';
import { Song, Playlist } from '@/types';
import Image from 'next/image';

export default function HostModePage() {
  const router = useRouter();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'playlists' | 'songs'>('playlists');
  const [selectedGenre, setSelectedGenre] = useState<string>('全部');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('全部');
  const [songsDisplayCount, setSongsDisplayCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  
  const allSongs = getAllSongs();

  // 获取所有类型和语言选项
  const allGenres = ['全部', ...Array.from(new Set(allSongs.flatMap(song => song.genre)))];
  const allLanguages = ['全部', ...Array.from(new Set(allSongs.map(song => {
    const langMap: {[key: string]: string} = {
      'zh': '中文',
      'en': '英文', 
      'jp': '日文',
      'ko': '韩文',
      'other': '其他'
    };
    return langMap[song.language] || '其他';
  })))];

  // 过滤歌曲
  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === '全部' || song.genre.includes(selectedGenre);
    const songLanguage = {
      'zh': '中文',
      'en': '英文',
      'jp': '日文', 
      'ko': '韩文',
      'other': '其他'
    }[song.language] || '其他';
    const matchesLanguage = selectedLanguage === '全部' || songLanguage === selectedLanguage;
    
    return matchesSearch && matchesGenre && matchesLanguage;
  });

  // 显示的歌曲列表（分页）
  const displayedSongs = filteredSongs.slice(0, songsDisplayCount);
  const hasMoreSongs = filteredSongs.length > songsDisplayCount;

  // 添加歌曲到队列
  const addSongToQueue = (song: Song) => {
    if (!selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  // 从队列中移除歌曲
  const removeSongFromQueue = (songId: string) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== songId));
  };

  // 选择整个歌单
  const selectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setSelectedSongs(playlist.songs);
  };

  // 加载更多歌曲
  const loadMoreSongs = async () => {
    setIsLoading(true);
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSongsDisplayCount(prev => prev + 12);
    setIsLoading(false);
  };

  // 开始游戏
  const startGame = () => {
    if (selectedSongs.length > 0) {
      // 将选中的歌曲传递给播放页面
      localStorage.setItem('gameQueue', JSON.stringify(selectedSongs));
      router.push('/host/play');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* 顶部导航 */}
      <motion.div
        className="bg-white/80 backdrop-blur-md border-b border-gray-200"
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
              <Crown className="text-amber-500" size={24} />
              <h1 className="text-xl font-semibold">主持人模式</h1>
            </div>
          </div>
          
          {/* 开始按钮 */}
          <motion.button
            onClick={startGame}
            disabled={selectedSongs.length === 0}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Play size={18} />
              开始猜歌 ({selectedSongs.length})
            </div>
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：音乐库 */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* 标签切换 */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('playlists')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeTab === 'playlists'
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  官方歌单
                </button>
                <button
                  onClick={() => setActiveTab('songs')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeTab === 'songs'
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  单曲选择
                </button>
              </div>

              {/* 搜索和过滤 */}
              {activeTab === 'songs' && (
                <div className="mb-6 space-y-4">
                  {/* 搜索框 */}
                  <input
                    type="text"
                    placeholder="搜索歌曲或歌手..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  
                  {/* 过滤器 */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">类型:</label>
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        {allGenres.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">语言:</label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        {allLanguages.map((language) => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      共找到 {filteredSongs.length} 首歌曲
                    </div>
                  </div>
                </div>
              )}

              {/* 歌单展示 */}
              {activeTab === 'playlists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPlaylists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => selectPlaylist(playlist)}
                    >
                      <div className="aspect-square relative mb-3">
                        <Image
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          fill
                          sizes="(max-width:768px) 100vw, 50vw"
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <h3 className="font-medium mb-1">{playlist.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{playlist.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {playlist.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 单曲展示 */}
              {activeTab === 'songs' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {displayedSongs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🎵</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{song.title}</h4>
                          <p className="text-sm text-gray-600">{song.artist}</p>
                          <div className="flex gap-2 mt-1">
                            {song.genre.slice(0, 2).map((genre) => (
                              <span
                                key={genre}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          <div>{song.year}</div>
                          <div className="mt-1">
                            {{
                              'zh': '中文',
                              'en': '英文',
                              'jp': '日文',
                              'ko': '韩文',
                              'other': '其他'
                            }[song.language]}
                          </div>
                        </div>
                        <motion.button
                          onClick={() => addSongToQueue(song)}
                          disabled={selectedSongs.find(s => s.id === song.id) !== undefined}
                          className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 加载更多按钮 */}
                  {hasMoreSongs && (
                    <motion.div
                      className="flex justify-center pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <button
                        onClick={loadMoreSongs}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            加载中...
                          </>
                        ) : (
                          `加载更多 (还有 ${filteredSongs.length - songsDisplayCount} 首)`
                        )}
                      </button>
                    </motion.div>
                  )}
                  
                  {/* 没有更多歌曲时的提示 */}
                  {!hasMoreSongs && displayedSongs.length > 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      已显示全部 {filteredSongs.length} 首歌曲
                    </div>
                  )}
                  
                  {/* 没有找到歌曲的提示 */}
                  {filteredSongs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">🔍</span>
                      <p>没有找到符合条件的歌曲</p>
                      <p className="text-sm mt-1">试试调整搜索条件或过滤器</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* 右侧：猜歌队列 */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold mb-4">猜歌队列</h2>
              
              {selectedPlaylist && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-amber-700">已选择歌单:</span>
                  </div>
                  <p className="font-medium text-amber-800">{selectedPlaylist.name}</p>
                </div>
              )}

              {selectedSongs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">🎵</span>
                  <p>还没有选择歌曲</p>
                  <p className="text-sm">从左侧选择歌单或添加单曲</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSongs.map((song, index) => (
                    <motion.div
                      key={song.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{song.title}</p>
                        <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => removeSongFromQueue(song.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}