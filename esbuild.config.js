const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: ['src/content.js'],
    bundle: true,
    outfile: 'content.js',
    format: 'iife', // Wraps everything in an IIFE — no global leaks
    target: ['chrome100'], // Chrome extensions target
    minify: false, // Keep readable for debugging
    sourcemap: false, // No sourcemaps needed for extension
    logLevel: 'info',
};

if (isWatch) {
    esbuild.context(buildOptions).then(ctx => {
        ctx.watch();
        console.log('👀 Watching for changes...');
    });
} else {
    esbuild.build(buildOptions).then(() => {
        console.log('✅ Build completed!');
    }).catch(() => process.exit(1));
}
