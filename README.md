# 📱 智能手机使用指南

> 专为老年朋友设计的交互式智能手机使用指南

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## 🎯 项目简介

本项目是一个专为老年用户优化的智能手机使用指南网页应用。采用大字体、高对比度、简洁直观的界面设计，帮助老年朋友轻松掌握智能手机的基本操作。

### ✨ 核心特性

- 📱 **完全响应式** - 适配手机、平板、电脑等各种设备
- 🔍 **全文搜索** - 快速定位所需内容
- 📖 **清晰导航** - 侧边栏目录，一目了然
- 🎯 **步骤演示** - 图文并茂，循序渐进
- 💾 **进度保存** - 自动记录阅读进度
- 🌓 **深色模式** - 支持浅色/深色主题切换
- ♿ **无障碍优化** - 符合老年用户使用习惯

## 🚀 快速开始

### 本地预览

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd 智能手机使用指南

# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 打开浏览器访问
open http://localhost:8080
```

### 在线访问

- **Vercel**: [https://your-project.vercel.app](https://your-project.vercel.app)
- **Cloudflare Pages**: [https://your-project.pages.dev](https://your-project.pages.dev)

## 📁 项目结构

```
智能手机使用指南/
├── index.html              # 主页面
├── css/
│   ├── style.css          # 主样式表
│   ├── responsive.css     # 响应式样式
│   └── elderly-friendly.css # 老年友好样式
├── js/
│   └── app.js             # 主应用脚本
├── images/
│   ├── extracted/         # 教程截图
│   └── pages/             # 页面图片
├── vercel.json            # Vercel 部署配置
├── _headers               # Cloudflare Headers 配置
├── .gitignore             # Git 忽略配置
├── README.md              # 项目说明
└── DEPLOY.md              # 部署指南
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **样式**: CSS Variables, Flexbox, Grid
- **图标**: SVG Icons (Feather Icons style)
- **字体**: Noto Sans SC (思源黑体)
- **部署**: Vercel / Cloudflare Pages

## 📋 功能模块

### 日常使用
- 认识图标
- 放大功能（字体、音量、图标、图片）
- 极简模式
- 储存联系人
- 软件下载与卸载
- 设置壁纸
- 小爱同学语音助手
- 省电模式
- 手电筒
- 清理手机垃圾

### 出行导航
- 查询路线
- 乘坐公交地铁
- 查询小米门店

### 拍照摄影
- 相机使用
- 拍照小技巧（运动抓拍、超级防抖、提词器、照片水印）

### 微信使用
- 添加好友
- 发起群聊
- 消息免打扰
- 黑名单功能
- 视频语音通话
- 发红包

### 移动支付
- 微信支付
- 支付宝支付

### 安全防护
- 来电短信拦截
- 安全守护
- 国家反诈APP
- 国务院客户端

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + ←` | 上一页 |
| `Ctrl/Cmd + →` | 下一页 |
| `Esc` | 关闭图片查看器 / 关闭搜索 |

## 🌐 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📦 部署

详见 [DEPLOY.md](./DEPLOY.md)

### 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smartphone-user-guide)

### 部署到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Pages > Create a project
3. 连接 Git 仓库或上传文件
4. 构建设置保持默认（无需构建命令）
5. 点击 Deploy

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

- 感谢所有为老年数字鸿沟问题付出努力的人们
- 感谢开源社区提供的优秀工具和灵感

---

<p align="center">Made with ❤️ for elderly users</p>
