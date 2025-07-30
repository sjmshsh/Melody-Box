-- 强制修复所有玩家的在线状态
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 将所有玩家强制设置为在线状态
UPDATE players 
SET is_online = true, 
    last_seen = NOW()
WHERE TRUE; -- 更新所有记录

-- 2. 验证修复结果
SELECT 
    r.room_code,
    p.player_name,
    p.is_online,
    p.is_host,
    p.score,
    p.last_seen
FROM rooms r
JOIN players p ON r.id = p.room_id
ORDER BY r.room_code, p.is_host DESC, p.created_at;

-- 3. 检查在线玩家统计
SELECT 
    r.room_code,
    COUNT(p.id) as total_players,
    COUNT(CASE WHEN p.is_online = true THEN 1 END) as online_players
FROM rooms r
LEFT JOIN players p ON r.id = p.room_id
WHERE r.game_state != 'finished'
GROUP BY r.room_code, r.id
ORDER BY r.room_code;