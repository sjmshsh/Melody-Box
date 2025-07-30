-- 在Supabase控制台的SQL编辑器中运行这些命令来创建所需的表

-- 1. 创建房间表
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(20) UNIQUE NOT NULL,
  host_id VARCHAR(50) NOT NULL,
  current_song_id VARCHAR(50),
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 5,
  game_state VARCHAR(20) DEFAULT 'waiting' CHECK (game_state IN ('waiting', 'playing', 'revealed', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建玩家表
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(50) PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建游戏事件表
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_is_online ON players(is_online);
CREATE INDEX IF NOT EXISTS idx_game_events_room_id ON game_events(room_id);

-- 5. 启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- 6. 创建自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 为房间表创建触发器
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 设置行级安全策略 (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（在演示环境中，实际项目中应该更严格）
CREATE POLICY "Enable all operations for rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Enable all operations for players" ON players FOR ALL USING (true);
CREATE POLICY "Enable all operations for game_events" ON game_events FOR ALL USING (true);

-- 9. 清理旧房间的函数（可选）
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
    -- 删除超过2小时未更新的房间
    DELETE FROM rooms 
    WHERE updated_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;