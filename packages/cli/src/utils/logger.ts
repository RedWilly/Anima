/**
 * Logger utility with colored output.
 * Uses ANSI escape codes for terminal colors.
 */

const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

/**
 * Logger with colored output for CLI.
 */
export const logger = {
    /** Informational message (cyan) */
    info(message: string): void {
        console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`);
    },

    /** Success message (green) */
    success(message: string): void {
        console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
    },

    /** Warning message (yellow) */
    warn(message: string): void {
        console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
    },

    /** Error message (red) */
    error(message: string): void {
        console.error(`${COLORS.red}✗${COLORS.reset} ${message}`);
    },

    /** Dimmed message for secondary info */
    dim(message: string): void {
        console.log(`${COLORS.dim}${message}${COLORS.reset}`);
    },

    /** Bold heading */
    heading(message: string): void {
        console.log(`\n${COLORS.bold}${message}${COLORS.reset}\n`);
    },

    /** Print a newline */
    newline(): void {
        console.log();
    },
};

/**
 * Simple spinner for long-running operations.
 */
export class Spinner {
    private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private frameIndex = 0;
    private message: string;
    private interval: ReturnType<typeof setInterval> | null = null;

    constructor(message: string) {
        this.message = message;
    }

    start(): this {
        process.stdout.write(`${COLORS.cyan}${this.frames[0]}${COLORS.reset} ${this.message}`);
        this.interval = setInterval(() => {
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
            process.stdout.write(`\r${COLORS.cyan}${this.frames[this.frameIndex]}${COLORS.reset} ${this.message}`);
        }, 80);
        return this;
    }

    stop(success = true): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        const symbol = success
            ? `${COLORS.green}✓${COLORS.reset}`
            : `${COLORS.red}✗${COLORS.reset}`;
        process.stdout.write(`\r${symbol} ${this.message}\n`);
    }

    fail(): void {
        this.stop(false);
    }
}
