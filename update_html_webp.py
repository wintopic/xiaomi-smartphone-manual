#!/usr/bin/env python3
"""
更新HTML文件中的图片引用，使用WebP格式
"""

import re
from pathlib import Path

def update_html_webp(html_path):
    """更新HTML文件中的图片引用"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 统计替换数量
    original_count = content.count('.png"') + content.count(".png'")
    
    # 替换 .png 为 .webp (保留.png作为fallback)
    # 使用picture标签来提供WebP和PNG两种格式
    
    # 首先处理简单的img标签替换
    # 将 src=".../.png" 改为 src=".../.webp"，但添加data-original属性保留原格式
    
    # 匹配 img 标签中的 src 属性
    img_pattern = r'<img([^>]+)src="([^"]+)\.png"([^>]*)>'
    
    def replace_img(match):
        before = match.group(1)
        path = match.group(2)
        after = match.group(3)
        
        # 创建picture标签
        webp_src = f'{path}.webp'
        png_src = f'{path}.png'
        
        # 保留原img标签，但添加data-webp属性，让JS处理格式切换
        return f'<img{before}src="{webp_src}" data-fallback="{png_src}"{after}>'
    
    new_content = re.sub(img_pattern, replace_img, content)
    
    # 同样处理单引号的情况
    img_pattern_single = r"<img([^>]+)src='([^']+)\.png'([^>]*)>"
    new_content = re.sub(img_pattern_single, replace_img, new_content)
    
    # 写回文件
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    new_count = new_content.count('.webp"') + new_content.count(".webp'")
    return original_count, new_count

def main():
    html_path = Path('index.html')
    
    if not html_path.exists():
        print(f"❌ 文件不存在: {html_path}")
        return
    
    print("🚀 更新HTML图片引用为WebP格式...")
    print("=" * 60)
    
    original, new = update_html_webp(html_path)
    
    print(f"✓ 更新完成!")
    print(f"  原始PNG引用: {original} 处")
    print(f"  新WebP引用: {new} 处")
    print("=" * 60)
    print("\n💡 提示: 已添加 data-fallback 属性保留PNG作为后备格式")

if __name__ == '__main__':
    main()
