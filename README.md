# 中文学习 | Học tiếng Trung

为越南学生设计的中文线上练习平台。

## 功能特色

- 🤓 **AI 自动出题** - 老师指定语法点，AI 自动生成练习题
- 📖 **多种题型** - 选择题、填空题、翻译题、判断题
- 📊 **学习跟踪** - 学生答题记录、错题本、进步趋势
- 👥 **账号管理** - 教师账号 / 学生账号分离

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Next.js 16 (App Router) |
| 样式 | Tailwind CSS 4 |
| 数据库 | SQLite (通过 Prisma + libSQL) |
| 认证 | JWT (jsonwebtoken) |
| AI | OpenAI API (GPT-4o-mini) |

## 开始使用

### 本地开发

```
cd chinese-teaching
npm install
npm run dev
# 打开 http://localhost:3000
```

### 部署到 Vercel

1. 推送代码到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "Add New" > "Project"
4. 导入你的 GitHub 仓库
5. 在 Environment Variables 中设置：
   - `DATABASE_URL` - 数据库连接链接
   - `JWT_SECRET` - 修改为一个安全的密钥
   - `OPENAI_API_KEY` - (可选) OpenAI API Key
6. 点击 "Deploy"

> 注意: Vercel 的无服务器环境不支持本地文件数据库。需要使用云数据库服务：
> - [Turso](https://turso.tech) - 免费额度够用 (SQLite)
> - [Supabase](https://supabase.com) - PostgreSQL，有免费额度

### 配置 AI 出题

1. 获取 OpenAI API Key (https://platform.openai.com)
2. 在 .env 文件中设置: `OPENAI_API_KEY="sk-..."`
3. 如果不设置，系统会自动使用模拟数据出题

## 项目结构

```
src/
  app/
    (auth)/       # 登录/注册页面
    (dashboard)/  # 老师/学生控制面板
    api/          # 后端 API 接口
  lib/            # 工具库
    prisma.ts     # Prisma 客户端
    auth.ts       # JWT/BCrypt
prisma/           # 数据库配置
.env              # 环境变量
```