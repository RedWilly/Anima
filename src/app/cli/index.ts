import { Command } from 'commander';
import { listScenes } from './commands/list-scenes';
import { render } from './commands/render';
import { preview } from './commands/preview';
import { exportFrame } from './commands/export-frame';

const program = new Command();

program
    .name('anima')
    .description('CLI for Anima animation engine')
    .version('0.1.0');

// Global options
program.option('-d, --debug', 'output extra debugging');

// list-scenes command
program
    .command('list-scenes')
    .description('List all scenes in a file')
    .argument('<file>', 'TypeScript file to load')
    .action(async (file) => {
        await listScenes(file);
    });

// render command
program
    .command('render')
    .description('Render a scene from a file')
    .argument('<file>', 'TypeScript file to load')
    .option('-s, --scene <name>', 'Specific scene to render')
    .option('-f, --format <type>', 'Output format (mp4, webp, gif, sprite, png)', 'mp4')
    .option('-r, --resolution <preset>', 'Resolution preset (480, 720, 1080, 4K)')
    .option('--fps <number>', 'Frames per second')
    .option('-q, --quality <level>', 'Render quality (production, preview)', 'production')
    .option('-o, --output <path>', 'Output file path')
    .action(async (file, options) => {
        await render(file, options);
    });

// preview command
program
    .command('preview')
    .description('Quickly preview a scene (lower quality)')
    .argument('<file>', 'TypeScript file to load')
    .option('-s, --scene <name>', 'Specific scene to preview')
    .option('-f, --format <type>', 'Output format', 'mp4')
    .option('-o, --output <path>', 'Output file path')
    .action(async (file, options) => {
        await preview(file, options);
    });

// export-frame command
program
    .command('export-frame')
    .description('Export a single frame as PNG')
    .argument('<file>', 'TypeScript file to load')
    .option('-s, --scene <name>', 'Specific scene')
    .option('--frame <number|last>', 'Frame number or "last"', 'last')
    .option('-o, --output <path>', 'Output file path')
    .action(async (file, options) => {
        await exportFrame(file, options);
    });

// Handle unknown commands
program.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

program.parse(process.argv);
