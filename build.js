const fs = require('fs').promises;
const path = require('path');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');

/**
 * Main build function
 */
async function build() {
    console.log('🚀 Starting build process...\n');
    const startTime = Date.now();

    try {
        // Create dist directory
        await ensureDir(DIST_DIR);

        // Process JavaScript files
        await processJavaScript();

        // Process CSS files
        await processCSS();

        // Copy static files
        await copyStaticFiles();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ Build completed successfully in ${duration}s!`);
    } catch (error) {
        console.error('\n❌ Build failed:', error);
        process.exit(1);
    }
}

/**
 * Ensure directory exists, create if not
 */
async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

/**
 * Process and minify JavaScript files
 */
async function processJavaScript() {
    console.log('📦 Minifying JavaScript files...');

    const jsFiles = await findFiles(SRC_DIR, '.js');
    let processed = 0;
    let totalOriginal = 0;
    let totalMinified = 0;

    for (const file of jsFiles) {
        const code = await fs.readFile(file, 'utf-8');
        const originalSize = code.length;

        try {
            const result = await minifyJS(code, {
                compress: {
                    dead_code: true,
                    drop_console: process.env.NODE_ENV === 'production',
                    drop_debugger: true,
                    passes: 2
                },
                mangle: process.env.NODE_ENV === 'production',
                format: {
                    comments: false
                }
            });

            const minifiedSize = result.code.length;
            const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

            const relativePath = path.relative(SRC_DIR, file);
            const outPath = path.join(DIST_DIR, relativePath);
            const outDir = path.dirname(outPath);

            // Ensure directory structure is preserved (especially for backend subdirectories)
            await ensureDir(outDir);
            await fs.writeFile(outPath, result.code);

            console.log(`  ✓ ${relativePath} (${formatBytes(originalSize)} → ${formatBytes(minifiedSize)}, -${savings}%)`);

            processed++;
            totalOriginal += originalSize;
            totalMinified += minifiedSize;
        } catch (error) {
            console.error(`  ✗ ${path.relative(SRC_DIR, file)}: ${error.message}`);
        }
    }

    const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
    console.log(`  📊 Total: ${processed} files, ${formatBytes(totalOriginal)} → ${formatBytes(totalMinified)} (-${totalSavings}%)\n`);
}

/**
 * Process and minify CSS files
 */
async function processCSS() {
    console.log('🎨 Minifying CSS files...');

    const cssFiles = await findFiles(SRC_DIR, '.css');
    const cleanCSS = new CleanCSS({
        level: 2,
        returnPromise: false
    });

    let processed = 0;
    let totalOriginal = 0;
    let totalMinified = 0;

    for (const file of cssFiles) {
        const code = await fs.readFile(file, 'utf-8');
        const originalSize = code.length;

        try {
            const result = cleanCSS.minify(code);

            if (result.errors.length > 0) {
                console.error(`  ✗ ${path.relative(SRC_DIR, file)}: ${result.errors.join(', ')}`);
                continue;
            }

            const minifiedSize = result.styles.length;
            const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

            const relativePath = path.relative(SRC_DIR, file);
            const outPath = path.join(DIST_DIR, relativePath);
            const outDir = path.dirname(outPath);

            await ensureDir(outDir);
            await fs.writeFile(outPath, result.styles);

            console.log(`  ✓ ${relativePath} (${formatBytes(originalSize)} → ${formatBytes(minifiedSize)}, -${savings}%)`);

            processed++;
            totalOriginal += originalSize;
            totalMinified += minifiedSize;
        } catch (error) {
            console.error(`  ✗ ${path.relative(SRC_DIR, file)}: ${error.message}`);
        }
    }

    const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);
    console.log(`  📊 Total: ${processed} files, ${formatBytes(totalOriginal)} → ${formatBytes(totalMinified)} (-${totalSavings}%)\n`);
}

/**
 * Copy static files (HTML, images, fonts, etc.)
 */
async function copyStaticFiles() {
    console.log('📋 Copying static files...');

    const extensions = ['.html', '.json', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico'];
    const files = await findFiles(SRC_DIR, extensions);

    let copied = 0;

    for (const file of files) {
        const relativePath = path.relative(SRC_DIR, file);
        const outPath = path.join(DIST_DIR, relativePath);
        const outDir = path.dirname(outPath);

        await ensureDir(outDir);
        await fs.copyFile(file, outPath);
        copied++;
    }

    console.log(`  ✓ Copied ${copied} files\n`);
}

/**
 * Find files recursively with specific extensions
 */
async function findFiles(dir, extensions) {
    let results = [];

    try {
        const list = await fs.readdir(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules and hidden directories
                if (file === 'node_modules' || file.startsWith('.')) {
                    continue;
                }
                const subResults = await findFiles(filePath, extensions);
                results = results.concat(subResults);
            } else {
                const ext = path.extname(file);
                if (Array.isArray(extensions) ? extensions.includes(ext) : ext === extensions) {
                    results.push(filePath);
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return results;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Run build
build().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
