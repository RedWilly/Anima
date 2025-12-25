/**
 * New command - scaffolds a new animation project.
 */

import { resolve, join } from 'path';
import { logger } from './utils/logger';
import { getString } from './utils/args';

export interface NewOptions {
    flags: Record<string, string | boolean>;
}

/**
 * Default package.json template.
 */
function getPackageJson(name: string): string {
    return JSON.stringify(
        {
            name,
            version: '0.1.0',
            type: 'module',
            scripts: {
                dev: 'anima preview src/animation.ts',
                build: 'anima render src/animation.ts',
            },
            dependencies: {
                '@anima/server-renderer': '^0.1.0',
            },
            devDependencies: {
                typescript: '^5.0.0',
            },
        },
        null,
        2
    );
}

/**
 * Default tsconfig.json template.
 */
function getTsConfig(): string {
    return JSON.stringify(
        {
            compilerOptions: {
                target: 'ESNext',
                module: 'ESNext',
                moduleResolution: 'bundler',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
            },
            include: ['src/**/*'],
        },
        null,
        2
    );
}

/**
 * Default animation file template.
 */
function getAnimationTemplate(): string {
    return `/**
 * Anima Animation
 * 
 * This is your animation entry point.
 * Export a Scene as the default export.
 */

import { scene, circle, rectangle, group } from '@anima/server-renderer';

// Create the scene
const myScene = scene({ width: 800, height: 600, background: '#1a1a2e' });

// Add shapes
const myCircle = myScene.add(circle({ radius: 40 }));
const myRect = myScene.add(rectangle({ width: 80, height: 60 }));

// Animate!
myCircle
    .moveTo(200, 300, { duration: 1 })
    .parallel([
        c => c.scaleTo(1.5, 1.5, { duration: 0.5 }),
        c => c.moveTo(400, 300, { duration: 1 })
    ])
    .fadeOut({ duration: 0.5 });

myRect
    .moveTo(600, 300, { duration: 1.5 })
    .rotateTo(Math.PI * 2, { duration: 1 });

// Export the scene
export default myScene;
`;
}

/**
 * Minimal animation file template.
 */
function getMinimalTemplate(): string {
    return `import { scene, circle } from '@anima/server-renderer';

const s = scene({ width: 800, height: 600 });
const c = s.add(circle());

c.moveTo(400, 300, { duration: 1 });

export default s;
`;
}

/**
 * Default .gitignore template.
 */
function getGitignore(): string {
    return `node_modules/
dist/
*.mp4
*.webm
*.gif
.DS_Store
`;
}

/**
 * Execute the new command.
 */
export async function newCommand(projectName: string, options: NewOptions): Promise<void> {
    const { flags } = options;

    // Validate project name
    if (!projectName || projectName.startsWith('-')) {
        logger.error('Please provide a project name.');
        logger.dim('Usage: anima new my-animation');
        process.exit(1);
    }

    const template = getString(flags, ['template'], 'default');
    const projectPath = resolve(process.cwd(), projectName);

    // Check if directory already exists
    try {
        const stat = await Bun.file(join(projectPath, 'package.json')).exists();
        if (stat) {
            logger.error(`Directory '${projectName}' already contains a project.`);
            process.exit(1);
        }
    } catch {
        // Directory doesn't exist, which is fine
    }

    logger.heading('Creating new Anima project');
    logger.info(`Project: ${projectName}`);
    logger.info(`Template: ${template}`);
    logger.newline();

    // Create directory structure
    await Bun.write(join(projectPath, 'package.json'), getPackageJson(projectName));
    await Bun.write(join(projectPath, 'tsconfig.json'), getTsConfig());
    await Bun.write(join(projectPath, '.gitignore'), getGitignore());

    // Create animation file based on template
    const animationContent = template === 'minimal' ? getMinimalTemplate() : getAnimationTemplate();
    await Bun.write(join(projectPath, 'src', 'animation.ts'), animationContent);

    logger.success(`Created project at ${projectPath}`);
    logger.newline();
    logger.info('Next steps:');
    logger.dim(`  cd ${projectName}`);
    logger.dim('  bun install');
    logger.dim('  bun run dev');
}

/**
 * Show help for new command.
 */
export function showNewHelp(): void {
    logger.heading('anima new <name>');
    console.log('Scaffold a new animation project.\n');
    console.log('Usage:');
    console.log('  anima new my-animation');
    console.log('  anima new my-animation --template minimal\n');
    console.log('Options:');
    console.log('  --template <name>     Template: default, minimal (default: default)');
    console.log('  -h, --help            Show this help');
}
