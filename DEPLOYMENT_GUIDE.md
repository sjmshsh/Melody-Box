# 🚀 Melody Box 部署指南

## 📋 部署前准备

### 1. Supabase 数据库设置

首先需要在您的 Supabase 项目中创建所需的数据库表：

1. 打开 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单的 "SQL Editor"
4. 将以下 SQL 代码复制并执行：

```sql
-- 复制 supabase-setup.sql 文件中的内容并在 SQL Editor 中执行
```

**重要提示：** 请将 `supabase-setup.sql` 文件中的完整 SQL 代码在 Supabase 的 SQL Editor 中执行。

### 2. 验证数据库设置

执行 SQL 后，您应该能在 "Table Editor" 中看到以下表：
- `rooms` - 房间信息表
- `players` - 玩家信息表  
- `game_events` - 游戏事件表

## 🔧 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🌐 Vercel 部署

### 1. 连接 GitHub

1. 将项目推送到 GitHub 仓库
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择您的 GitHub 仓库

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量（虽然当前代码中直接使用了配置，但为了安全考虑建议使用环境变量）：

```
NEXT_PUBLIC_SUPABASE_URL=https://wqbqaplufruogrkhvtgf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYnFhcGx1ZnJ1b2dya2h2dGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODUwNzgsImV4cCI6MjA2OTQ2MTA3OH0.2cuoGE3KxNmAS3PAGAg7pdgxNyDipGGGeH4BjaTAHB0
```

### 3. 部署设置

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. 完成部署

点击 "Deploy" 按钮，Vercel 将自动构建和部署您的应用。

## ✨ 功能测试

部署完成后，请测试以下功能：

### 单机模式
1. 访问应用首页
2. 点击 "扭蛋模式"
3. 选择 "单机模式"
4. 测试扭蛋机和音频播放功能

### 联机模式
1. 点击 "扭蛋模式"
2. 选择 "联机模式"
3. 测试 "创建房间" 功能
4. 用另一个浏览器窗口测试 "加入房间"
5. 验证实时同步功能

### 主持人模式
1. 测试歌单选择功能
2. 测试单曲选择和过滤功能
3. 测试播放控制功能

## 🎵 音频文件配置

当前项目使用的真实音频文件：
- `public/clips/猜歌-二十二.mp3`
- `public/clips/原曲片段-二十二.mp3`
- `public/clips/猜歌-晴天.mp3`
- `public/clips/原曲片段-晴天.mp3`
- `public/clips/猜歌-离别开出花.mp3`
- `public/clips/原曲片段-离别开出花.mp3`
- `public/clips/猜歌-Super Star.mp3`
- `public/clips/原曲片段-Super Star.mp3`

## 🐛 故障排除

### 常见问题

1. **Supabase 连接失败**
   - 检查 API URL 和 Key 是否正确
   - 确认数据库表已正确创建
   - 查看浏览器控制台的错误信息

2. **音频播放失败**
   - 确认音频文件存在于 `public/clips/` 目录
   - 检查浏览器的自动播放策略
   - 确认网络连接正常

3. **实时同步不工作**
   - 确认 Supabase 实时功能已启用
   - 检查数据库的 RLS 策略配置
   - 验证网络连接稳定性

### 调试技巧

1. 打开浏览器开发者工具查看控制台错误
2. 在 Supabase 控制台查看数据库日志
3. 使用网络面板检查 API 请求状态

## 📞 技术支持

如果遇到部署问题，请检查：
1. Supabase 项目状态和配额
2. Vercel 部署日志
3. 浏览器控制台错误信息

## 🎯 性能优化建议

1. **音频优化**
   - 使用适当的音频压缩格式
   - 考虑使用 CDN 加速音频文件加载

2. **数据库优化**
   - 定期清理过期房间数据
   - 监控 Supabase 使用量

3. **前端优化**
   - 启用 Next.js 的静态优化
   - 使用 Vercel 的边缘缓存

---

🎵 **现在您可以享受 Melody Box 带来的音乐猜歌乐趣了！**