import { minify as htmlMinify } from 'minify';
import { minify as cssMinify } from 'minify';
import { minify as terserMinify } from 'terser';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';
import path from 'path';

let folderName = "dist";

// Create Output directory
const outputDir = path.join(process.cwd(), folderName);
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, {
        recursive: true,
        force: true
    });
}
console.error(`Creating ${folderName} folder -> ${outputDir}`);
fs.mkdirSync(outputDir);

// Minify files in specified directory
const minifyFiles = async (dir, extension, minifier) => {
    const files = fs.readdirSync(dir && dir !== "" ? dir : "./"); //check  for root

    for (const file of files) {
        const filePath = path.join(dir && dir !== "" ? dir : "./", file);
        const stats = fs.statSync(filePath);

        // Skip
        if (file === 'dist' || file === 'node_modules') {
            continue;
        }

        if (stats.isFile() && path.extname(file).toLowerCase() === extension) {
            // Keep the same structure for files
            const outputFilePath = path.join(outputDir, path.relative('./', filePath));

            // Create output directory if it doesn't exist
            const outputFileDir = path.dirname(outputFilePath);
            if (!fs.existsSync(outputFileDir)) {
                fs.mkdirSync(outputFileDir, {
                    recursive: true
                });
            }

            try {
                let minified;
                if (extension === '.js') {
                    const code = fs.readFileSync(filePath, 'utf8');
                    minified = await terserMinify(code);
                    fs.writeFileSync(outputFilePath, minified.code);
                } else {
                    minified = await minifier(filePath);
                    fs.writeFileSync(outputFilePath, minified);
                }
                console.log(`Minified File: ${file}`);
            } catch (error) {
                console.error(`Error minifying ${file}:`, error);
            }
        } else if (stats.isDirectory()) {
            // Recursively minify files in the subdirectory
            await minifyFiles(filePath, extension, minifier);
        }
    }
};

// Minify images in specified directory
const minifyImages = async (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        // Skip
        if (file === 'readme') {
            continue;
        }

        // Check if the current file is PNG
        if (/\.(png)$/.test(file)) {
            // Keep the same structure for images
            const outputImageDir = path.join(outputDir, 'assets', path.relative('./assets', dir));

            // Create the output directory for images if it doesn't exist
            if (!fs.existsSync(outputImageDir)) {
                fs.mkdirSync(outputImageDir, {
                    recursive: true
                });
            }

            try {
                await imagemin([filePath], {
                    destination: outputImageDir,
                    plugins: [
                        imageminPngquant({
                            quality: [0.6, 0.8]
                        })
                    ]
                });
                console.log(`Minified image: ${file}`);
            } catch (error) {
                console.error(`Error minifying image ${file}:`, error);
            }
        } else if (fs.statSync(filePath).isDirectory()) {
            // Recursively minify images in subdirectories
            await minifyImages(filePath);
        }
    }
};

// Copy necessary files as well (manifest.json)
const copyFiles = () => {
    const manifestSource = path.join(process.cwd(), 'manifest.json');
    if (fs.existsSync(manifestSource)) {
        fs.copyFileSync(manifestSource, path.join(outputDir, 'manifest.json'));
        console.log('Copied manifest.json to dist folder');
    } else {
        console.warn('manifest.json not found, skipping copy.');
    }
};

// Minify JavaScript, CSS, images, and copy necessary files
const build = async () => {
    try {
        await minifyFiles('', '.html', htmlMinify);
        await minifyFiles('./js', '.js', null); // No minifier, handled by Terser directly
        await minifyFiles('./css', '.css', cssMinify);
        await minifyImages('./assets');
        copyFiles();
        console.log(`Done -> ${outputDir}`);
    } catch (error) {
        console.error('Error during minification process:', error);
    }
};

build();