#!/usr/bin/env bun
/**
 * @anima/server-renderer CLI - Command-line interface for Anima animation engine.
 *
 * Commands:
 *   anima render <file>   - Render animation to video
 *   anima preview <file>  - Preview animation in system player
 *   anima new <name>      - Create new project
 */

import { parseArgs, getBoolean } from './utils/args';
import { logger } from './utils/logger';
import { renderCommand, showRenderHelp } from './render';
import { previewCommand, showPreviewHelp } from './preview';
import { newCommand, showNewHelp } from './new';

const VERSION = '0.1.0';

/**
 * Show main help.
 */
function showHelp(): void {
    logger.heading('Anima CLI');
    console.log('A command-line tool for the Anima animation engine.\n');
    console.log('Usage: anima <command> [options]\n');
    console.log('Commands:');
    console.log('  render <file>    Render animation to video');
    console.log('  preview <file>   Preview animation in system player');
    console.log('  new <name>       Create new animation project');
    console.log();
    console.log('Options:');
    console.log('  -v, --version    Show version');
    console.log('  -h, --help       Show help');
    console.log();
    console.log('Run `anima <command> --help` for command-specific help.');
}

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showHelp();
        process.exit(0);
    }

    const parsed = parseArgs(args);
    const [command, ...rest] = parsed.positional;

    // Handle global flags
    if (getBoolean(parsed.flags, ['v', 'version'])) {
        console.log(`anima v${VERSION}`);
        process.exit(0);
    }

    if (getBoolean(parsed.flags, ['h', 'help']) && !command) {
        showHelp();
        process.exit(0);
    }

    // Route to command
    switch (command) {
        case 'render': {
            if (getBoolean(parsed.flags, ['h', 'help'])) {
                showRenderHelp();
                process.exit(0);
            }
            const inputFile = rest[0];
            if (!inputFile) {
                logger.error('Missing input file.');
                logger.dim('Usage: anima render <file>');
                process.exit(1);
            }
            await renderCommand(inputFile, { flags: parsed.flags });
            break;
        }

        case 'preview': {
            if (getBoolean(parsed.flags, ['h', 'help'])) {
                showPreviewHelp();
                process.exit(0);
            }
            const inputFile = rest[0];
            if (!inputFile) {
                logger.error('Missing input file.');
                logger.dim('Usage: anima preview <file>');
                process.exit(1);
            }
            await previewCommand(inputFile, { flags: parsed.flags });
            break;
        }

        case 'new': {
            if (getBoolean(parsed.flags, ['h', 'help'])) {
                showNewHelp();
                process.exit(0);
            }
            const projectName = rest[0];
            if (!projectName) {
                logger.error('Missing project name.');
                logger.dim('Usage: anima new <name>');
                process.exit(1);
            }
            await newCommand(projectName, { flags: parsed.flags });
            break;
        }

        case 'help':
            showHelp();
            break;

        default:
            logger.error(`Unknown command: ${command}`);
            logger.dim('Run `anima --help` for available commands.');
            process.exit(1);
    }
}

// Run CLI
main().catch((err) => {
    logger.error(err.message);
    process.exit(1);
});
