# 🚀 部署指南

本文档详细介绍如何将智能手机使用指南部署到各种平台。

## 📑 目录

- [Vercel 部署](#vercel-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [GitHub Pages 部署](#github-pages-部署)
- [Netlify 部署](#netlify-部署)
- [静态服务器部署](#静态服务器部署)

---

## Vercel 部署

### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 进入项目目录
cd 智能手机使用指南

# 部署
vercel --prod
```

### 方式二：通过 Git 集成

1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New Project"
4. 导入你的 Git 仓库
5. 配置保持默认：
   - Framework Preset: `Other`
   - Build Command: （留空）
   - Output Directory: （留空）
6. 点击 Deploy

### 方式三：通过 Vercel 按钮

点击下面的按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smartphone-user-guide)

### 自定义域名

1. 在 Vercel Dashboard 选择项目
2. 进入 Settings > Domains
3. 添加你的域名
4. 按照提示配置 DNS 记录

---

## Cloudflare Pages 部署

### 方式一：通过 Git 集成（推荐）

1. 将项目推送到 GitHub/GitLab
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 Pages > Create a project
4. 连接你的 Git 仓库
5. 构建设置：
   - Build command: （留空）
   - Build output directory: `/`
6. 点击 Save and Deploy

### 方式二：直接上传

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Pages > Create a project > Direct Upload
3. 将项目文件打包为 zip
4. 上传并部署

### 方式三：通过 Wrangler CLI

```bash
# 安装 Wrangler
npm i -g wrangler

# 登录 Cloudflare
wrangler login

# 进入项目目录
cd 智能手机使用指南

# 部署
wrangler pages deploy . --project-name=smartphone-guide
```

### 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 点击 "Custom domains" > "Set up a custom domain"
3. 输入你的域名
4. 按照提示完成 DNS 配置

---

## GitHub Pages 部署

### 方式一：通过 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 方式二：手动部署

1. 进入仓库 Settings > Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 `main` / `root`
4. 点击 Save

---

## Netlify 部署

### 通过 Netlify CLI

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 登录
netlify login

# 进入项目目录
cd 智能手机使用指南

# 部署
netlify deploy --prod --dir=.
```

### 通过 Git 集成

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 点击 "Add new site" > "Import an existing project"
3. 选择 Git 提供商并授权
4. 选择仓库
5. 构建设置保持默认
6. 点击 Deploy site

---

## 静态服务器部署

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/smartphone-guide;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache

创建 `.htaccess`：

```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# SPA fallback
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### Docker

创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine

# Copy project files
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：

```bash
# 构建镜像
docker build -t smartphone-guide .

# 运行容器
docker run -d -p 8080:80 --name smartphone-guide smartphone-guide
```

---

## 🔒 安全配置

所有部署配置已包含以下安全头：

| Header | Value | 说明 |
|--------|-------|------|
| X-Frame-Options | DENY | 防止点击劫持 |
| X-Content-Type-Options | nosniff | 防止 MIME 嗅探 |
| X-XSS-Protection | 1; mode=block | XSS 防护 |
| Referrer-Policy | strict-origin-when-cross-origin | 控制 Referrer |

---

## ⚡ 性能优化

### 缓存策略

静态资源已配置长期缓存：
- CSS/JS: 1年
- 图片: 1年
- HTML: 不缓存（便于更新）

### CDN 建议

推荐使用 CDN 加速：
- Cloudflare CDN（免费）
- jsDelivr（GitHub 文件加速）
- UNPKG（npm 包加速）

---

## 🐛 故障排除

### 图片无法加载

检查图片路径是否正确，确保大小写匹配。

### 样式丢失

检查 CSS 文件路径，确认 `_headers` 或 `vercel.json` 配置正确。

### 路由 404

确保配置了 SPA fallback 到 `index.html`。

---

## 📚 参考

- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Netlify Docs](https://docs.netlify.com/)

---

如有问题，请提交 [Issue](../../issues)。
