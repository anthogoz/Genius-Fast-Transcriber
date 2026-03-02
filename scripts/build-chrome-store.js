/**
 * build-chrome-store.js
 * 
 * Creates a ZIP for Chrome Web Store with automatic version naming.
 * Reads version from manifest.json and creates "Genius Fast Transcriber vX.X.X.zip"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');

console.log('📦 Building Chrome Web Store package...\n');

// Step 0: Read version from manifest.json
console.log('🔍 Reading version from manifest.json...');
let version = '0.0.0';
try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    version = manifest.version;
    console.log(`   ✅ Version: ${version}\n`);
} catch (error) {
    console.error('   ❌ Failed to read manifest.json');
    process.exit(1);
}

const DIST_DIR = path.join(ROOT, 'dist');
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}
const OUTPUT_ZIP = path.join(DIST_DIR, `Genius Fast Transcriber v${version}.zip`);

// Step 1: Build the extension
console.log('1️⃣  Building extension...');
try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
    console.log('   ✅ Build complete\n');
} catch (error) {
    console.error('   ❌ Build failed');
    process.exit(1);
}

// Step 2: Define files to include
console.log('2️⃣  Preparing files for Chrome Web Store...');

const filesToInclude = [
    'manifest.json',
    'content.js',
    'popup.html',
    'popup.js',
    'LICENSE',
];

// Add images directory if exists
const imagesDir = path.join(ROOT, 'images');
if (fs.existsSync(imagesDir)) {
    filesToInclude.push('images');
}

// Add _locales directory if exists
const localesDir = path.join(ROOT, '_locales');
if (fs.existsSync(localesDir)) {
    filesToInclude.push('_locales');
}

// Add styles.css if exists
if (fs.existsSync(path.join(ROOT, 'styles.css'))) {
    filesToInclude.push('styles.css');
}

// Add styles directory if exists
const stylesDir = path.join(ROOT, 'styles');
if (fs.existsSync(stylesDir) && fs.statSync(stylesDir).isDirectory()) {
    const styleFiles = fs.readdirSync(stylesDir);
    styleFiles.forEach(file => {
        filesToInclude.push(`styles/${file}`);
    });
}

console.log('Files to include:');
filesToInclude.forEach(f => console.log(`   ✅ ${f}`));
console.log();

// Step 3: Create ZIP
console.log('3️⃣  Creating ZIP file...\n');

// Remove old ZIPs with this version if they exist
if (fs.existsSync(OUTPUT_ZIP)) {
    fs.unlinkSync(OUTPUT_ZIP);
    console.log(`   🗑️  Removed old ZIP: ${path.basename(OUTPUT_ZIP)}`);
}

// Create temp directory
const tempDir = path.join(ROOT, '.temp-chrome-package');
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

console.log('   📂 Copying files to temporary directory...');

// Copy files to temp dir
let fileCount = 0;
filesToInclude.forEach(file => {
    const src = path.join(ROOT, file);
    const dest = path.join(tempDir, file);

    if (!fs.existsSync(src)) {
        console.log(`   ⚠️  Skipping ${file} (not found)`);
        return;
    }

    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.cpSync(src, dest, { recursive: true });
        // Count files in directory
        const files = fs.readdirSync(dest, { recursive: true });
        fileCount += files.length;
    } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
        fileCount++;
    }
});

console.log(`   ✅ Copied ${fileCount} files\n`);

// Compress using PowerShell
console.log('   🗜️  Compressing...');
const tempDirEscaped = tempDir.replace(/\\/g, '\\\\');
const outputZipEscaped = OUTPUT_ZIP.replace(/\\/g, '\\\\');
const psCommand = `Compress-Archive -Path '${tempDirEscaped}\\*' -DestinationPath '${outputZipEscaped}' -Force`;

try {
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`, {
        cwd: ROOT,
        stdio: 'pipe'
    });

    // Clean up temp dir
    fs.rmSync(tempDir, { recursive: true, force: true });

    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('\n✅ Chrome Web Store package created!\n');
    console.log('📦 Package details:');
    console.log(`   Name: Genius Fast Transcriber v${version}.zip`);
    console.log(`   Location: ${OUTPUT_ZIP}`);
    console.log(`   Size: ${sizeKB} KB (${sizeMB} MB)`);
    console.log(`   Files: ${fileCount}\n`);

    console.log('📋 Next steps:');
    console.log('   1. Upload to: https://chrome.google.com/webstore/devconsole');
    console.log('   2. Fill in store listing');
    console.log('   3. Submit for review\n');

    console.log(`🎉 Ready to publish version ${version}!\n`);

} catch (error) {
    console.error('\n❌ ZIP creation failed!');
    console.error('Error:', error.message);

    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    process.exit(1);
}
