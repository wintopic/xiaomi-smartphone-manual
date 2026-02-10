#!/usr/bin/env python3
"""
批量将PNG/JPG图片转换为WebP格式
"""

import os
import sys
from pathlib import Path
from PIL import Image

# 图片目录
IMAGE_DIRS = [
    'images/extracted',
    'images/pages'
]

# WebP转换选项
WEBP_QUALITY = 85

def convert_image(input_path):
    """转换单个图片为WebP格式"""
    input_path = Path(input_path)
    
    # 只处理PNG和JPG
    if input_path.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
        return None, "跳过非图片文件"
    
    output_path = input_path.with_suffix('.webp')
    
    # 如果WebP已存在且更新，则跳过
    if output_path.exists():
        if output_path.stat().st_mtime >= input_path.stat().st_mtime:
            return None, "已是最新"
    
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 转换为RGB（如果是RGBA则保留透明度）
            if img.mode in ('RGBA', 'LA', 'P'):
                # 保留透明度
                img = img.convert('RGBA')
            else:
                # 转为RGB
                img = img.convert('RGB')
            
            # 保存为WebP
            img.save(output_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        
        # 计算节省空间
        original_size = input_path.stat().st_size
        new_size = output_path.stat().st_size
        savings = (original_size - new_size) / original_size * 100
        
        return {
            'input': input_path.name,
            'output': output_path.name,
            'original_size': original_size,
            'new_size': new_size,
            'savings': savings
        }, None
        
    except Exception as e:
        return None, str(e)

def process_directory(directory):
    """处理目录中的所有图片"""
    results = []
    errors = []
    skipped = []
    
    dir_path = Path(directory)
    if not dir_path.exists():
        print(f"⚠️  目录不存在: {directory}")
        return results, errors, skipped
    
    # 获取所有图片文件
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg']:
        image_files.extend(dir_path.glob(ext))
    
    total = len(image_files)
    print(f"\n📁 处理目录: {directory} ({total} 个文件)")
    
    for i, img_path in enumerate(image_files, 1):
        result, error = convert_image(img_path)
        
        if result:
            results.append(result)
            print(f"  ✓ [{i}/{total}] {result['input']} → {result['output']} "
                  f"(-{result['savings']:.1f}%)")
        elif error == "跳过非图片文件":
            skipped.append(str(img_path))
        elif error == "已是最新":
            skipped.append(str(img_path))
        else:
            errors.append((str(img_path), error))
            print(f"  ✗ [{i}/{total}] {img_path.name}: {error}")
    
    return results, errors, skipped

def main():
    print("🚀 开始转换图片为 WebP 格式...")
    print("=" * 60)
    
    all_results = []
    all_errors = []
    all_skipped = []
    
    for directory in IMAGE_DIRS:
        results, errors, skipped = process_directory(directory)
        all_results.extend(results)
        all_errors.extend(errors)
        all_skipped.extend(skipped)
    
    # 统计
    print("\n" + "=" * 60)
    print("📊 转换完成统计")
    print("=" * 60)
    
    total_original = sum(r['original_size'] for r in all_results)
    total_new = sum(r['new_size'] for r in all_results)
    total_saved = total_original - total_new
    
    if total_original > 0:
        avg_savings = total_saved / total_original * 100
    else:
        avg_savings = 0
    
    print(f"✓ 成功转换: {len(all_results)} 张")
    print(f"○ 跳过: {len(all_skipped)} 张")
    print(f"✗ 失败: {len(all_errors)} 张")
    
    if all_results:
        print(f"\n💾 空间节省:")
        print(f"   原始大小: {total_original / 1024 / 1024:.2f} MB")
        print(f"   WebP大小: {total_new / 1024 / 1024:.2f} MB")
        print(f"   节省: {total_saved / 1024 / 1024:.2f} MB ({avg_savings:.1f}%)")
    
    print("=" * 60)
    
    # 显示错误
    if all_errors:
        print("\n⚠️  错误详情:")
        for path, error in all_errors[:5]:  # 只显示前5个错误
            print(f"   {Path(path).name}: {error}")
        if len(all_errors) > 5:
            print(f"   ... 还有 {len(all_errors) - 5} 个错误")

if __name__ == '__main__':
    # 检查PIL是否安装
    try:
        from PIL import Image
    except ImportError:
        print("正在安装 Pillow...")
        os.system(f"{sys.executable} -m pip install Pillow -q")
        from PIL import Image
        print("Pillow 安装完成\n")
    
    main()
