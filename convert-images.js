const fs = require('fs');
const path = require('path');

// 检查 sharp 是否已安装
try {
    require.resolve('sharp');
} catch (e) {
    console.log('正在安装 sharp...');
    const { execSync } = require('child_process');
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
}

const sharp = require('sharp');

// 图片目录
const imageDirs = [
    'images/extracted',
    'images/pages'
];

// 转换选项
const webpOptions = {
    quality: 85,
    effort: 6,
    smartSubsample: true
};

// 统计
let converted = 0;
let skipped = 0;
let errors = 0;
let totalOriginalSize = 0;
let totalNewSize = 0;

async function convertImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        skipped++;
        return;
    }

    const outputPath = inputPath.replace(ext, '.webp');
    
    // 如果WebP已存在且更新，则跳过
    try {
        const inputStat = fs.statSync(inputPath);
        if (fs.existsSync(outputPath)) {
            const outputStat = fs.statSync(outputPath);
            if (outputStat.mtime >= inputStat.mtime) {
                skipped++;
                return;
            }
        }

        totalOriginalSize += inputStat.size;

        await sharp(inputPath)
            .webp(webpOptions)
            .toFile(outputPath);

        const newSize = fs.statSync(outputPath).size;
        totalNewSize += newSize;
        
        const savings = ((inputStat.size - newSize) / inputStat.size * 100).toFixed(1);
        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (-${savings}%)`);
        converted++;
    } catch (err) {
        console.error(`✗ ${path.basename(inputPath)}: ${err.message}`);
        errors++;
    }
}

async function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`目录不存在: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            await processDirectory(fullPath);
        } else {
            await convertImage(fullPath);
        }
    }
}

async function main() {
    console.log('🚀 开始转换图片为 WebP 格式...\n');
    
    const startTime = Date.now();
    
    for (const dir of imageDirs) {
        await processDirectory(dir);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const totalSaved = ((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2);
    const avgSavings = totalOriginalSize > 0 
        ? ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1) 
        : 0;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 转换完成统计');
    console.log('='.repeat(50));
    console.log(`✓ 成功转换: ${converted} 张`);
    console.log(`○ 跳过: ${skipped} 张`);
    console.log(`✗ 失败: ${errors} 张`);
    console.log(`⏱️ 用时: ${duration} 秒`);
    console.log(`💾 节省空间: ${totalSaved} MB (${avgSavings}%)`);
    console.log('='.repeat(50));
}

main().catch(console.error);
