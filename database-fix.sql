-- 数据库修复脚本：将所有玩家设置为在线状态

-- 1. 将所有现有玩家设置为在线状态
UPDATE players 
SET is_online = true, 
    last_seen = NOW() 
WHERE is_online = false;

-- 2. 清理超过2小时的旧房间数据（可选）
DELETE FROM rooms 
WHERE updated_at < NOW() - INTERVAL '2 hours';

-- 3. 验证修复结果
SELECT 
    r.room_code,
    p.player_name,
    p.is_online,
    p.is_host,
    p.score
FROM rooms r
JOIN players p ON r.id = p.room_id
WHERE r.game_state != 'finished'
ORDER BY r.room_code, p.is_host DESC, p.created_at;