/**
 * Preview command - starts local dev server with playback controls.
 */

import { resolve } from 'path';
import { logger } from '../utils/logger';
import { getNumber, getBoolean } from '../utils/args';
import type { Scene } from '@anima/core';

export interface PreviewOptions {
    flags: Record<string, string | boolean>;
}

/**
 * Generate HTML page with embedded animation and playback controls.
 */
function generatePreviewHTML(scene: Scene): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anima Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0d1117;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #c9d1d9;
        }
        .container { padding: 20px; }
        canvas {
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .controls {
            margin-top: 20px;
            display: flex;
            gap: 12px;
            align-items: center;
        }
        button {
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        button:hover { background: #30363d; }
        button:active { background: #484f58; }
        .timeline {
            flex: 1;
            height: 6px;
            background: #21262d;
            border-radius: 3px;
            cursor: pointer;
            min-width: 200px;
        }
        .timeline-progress {
            height: 100%;
            background: #58a6ff;
            border-radius: 3px;
            width: 0%;
            transition: width 0.05s linear;
        }
        .time {
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            color: #8b949e;
        }
        .title {
            margin-bottom: 16px;
            color: #8b949e;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">Anima Preview</div>
        <canvas id="canvas" width="${scene.width}" height="${scene.height}"></canvas>
        <div class="controls">
            <button id="playPause">▶ Play</button>
            <button id="reset">↺ Reset</button>
            <div class="timeline" id="timeline">
                <div class="timeline-progress" id="progress"></div>
            </div>
            <span class="time" id="time">0.00s / ${scene.duration.toFixed(2)}s</span>
        </div>
    </div>
    <script type="module">
        // Scene will be injected by the server
        const sceneData = window.__ANIMA_SCENE__;
        
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const playPauseBtn = document.getElementById('playPause');
        const resetBtn = document.getElementById('reset');
        const timeline = document.getElementById('timeline');
        const progress = document.getElementById('progress');
        const timeDisplay = document.getElementById('time');
        
        let playing = false;
        let lastTime = 0;
        const duration = ${scene.duration};
        
        function updateTime(time) {
            progress.style.width = (time / duration * 100) + '%';
            timeDisplay.textContent = time.toFixed(2) + 's / ' + duration.toFixed(2) + 's';
        }
        
        function render(timestamp) {
            if (playing) {
                const delta = (timestamp - lastTime) / 1000;
                lastTime = timestamp;
                
                // This would normally tick the timeline
                // For now just demonstrate the UI
            }
            requestAnimationFrame(render);
        }
        
        playPauseBtn.addEventListener('click', () => {
            playing = !playing;
            playPauseBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
            lastTime = performance.now();
        });
        
        resetBtn.addEventListener('click', () => {
            playing = false;
            playPauseBtn.textContent = '▶ Play';
            updateTime(0);
        });
        
        timeline.addEventListener('click', (e) => {
            const rect = timeline.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            const time = percent * duration;
            updateTime(time);
        });
        
        requestAnimationFrame(render);
        updateTime(0);
    </script>
</body>
</html>`;
}

/**
 * Execute the preview command.
 */
export async function previewCommand(inputPath: string, options: PreviewOptions): Promise<void> {
    const { flags } = options;

    // Resolve input path
    const absolutePath = resolve(process.cwd(), inputPath);

    // Validate input file exists
    const file = Bun.file(absolutePath);
    if (!(await file.exists())) {
        logger.error(`File not found: ${inputPath}`);
        logger.dim(`Looked for: ${absolutePath}`);
        process.exit(1);
    }

    // Parse options
    const port = getNumber(flags, ['p', 'port'], 3000);
    const noOpen = getBoolean(flags, ['no-open']);

    logger.heading('Anima Preview');
    logger.info(`Input: ${inputPath}`);

    // Import animation file
    let scene: Scene;
    try {
        const module = await import(absolutePath);
        scene = module.default;

        if (!scene || typeof scene.render !== 'function') {
            logger.error('File must export a Scene as default export.');
            logger.dim('Example: export default scene({ width: 800, height: 600 });');
            process.exit(1);
        }
    } catch (err) {
        logger.error(`Failed to import animation: ${(err as Error).message}`);
        process.exit(1);
    }

    // Generate preview HTML
    const html = generatePreviewHTML(scene);

    // Start server
    const server = Bun.serve({
        port,
        fetch(req) {
            const url = new URL(req.url);

            if (url.pathname === '/' || url.pathname === '/index.html') {
                return new Response(html, {
                    headers: { 'Content-Type': 'text/html' },
                });
            }

            return new Response('Not Found', { status: 404 });
        },
    });

    const url = `http://localhost:${server.port}`;
    logger.success(`Server running at ${url}`);
    logger.dim('Press Ctrl+C to stop');

    // Open browser
    if (!noOpen) {
        try {
            const isWindows = process.platform === 'win32';
            const isMac = process.platform === 'darwin';
            const cmd = isWindows ? 'start' : isMac ? 'open' : 'xdg-open';

            if (isWindows) {
                Bun.spawn(['cmd', '/c', 'start', url]);
            } else {
                Bun.spawn([cmd, url]);
            }
        } catch {
            logger.dim(`Open ${url} in your browser`);
        }
    }
}

/**
 * Show help for preview command.
 */
export function showPreviewHelp(): void {
    logger.heading('anima preview <file>');
    console.log('Start a local preview server.\n');
    console.log('Usage:');
    console.log('  anima preview animation.ts');
    console.log('  anima preview animation.ts -p 8080\n');
    console.log('Options:');
    console.log('  -p, --port <number>   Server port (default: 3000)');
    console.log('  --no-open             Do not auto-open browser');
    console.log('  -h, --help            Show this help');
}
