/**
 * Argument parser for CLI commands.
 * Simple parser with no external dependencies.
 */

export interface ParsedArgs {
    /** Positional arguments (non-flag values) */
    positional: string[];
    /** Flag values (--flag value or --flag=value) */
    flags: Record<string, string | boolean>;
}

/**
 * Parse command-line arguments.
 * Supports:
 * - Positional args: `anima render file.ts`
 * - Boolean flags: `--verbose`
 * - Value flags: `--output out.mp4` or `--output=out.mp4`
 * - Short flags: `-o out.mp4`
 */
export function parseArgs(args: string[]): ParsedArgs {
    const result: ParsedArgs = {
        positional: [],
        flags: {},
    };

    let i = 0;
    while (i < args.length) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            // Long flag
            if (arg.includes('=')) {
                // --flag=value
                const [key, value] = arg.slice(2).split('=');
                result.flags[key] = value;
            } else {
                // --flag or --flag value
                const key = arg.slice(2);
                const next = args[i + 1];
                if (next && !next.startsWith('-')) {
                    result.flags[key] = next;
                    i++;
                } else {
                    result.flags[key] = true;
                }
            }
        } else if (arg.startsWith('-') && arg.length === 2) {
            // Short flag: -f value
            const key = arg.slice(1);
            const next = args[i + 1];
            if (next && !next.startsWith('-')) {
                result.flags[key] = next;
                i++;
            } else {
                result.flags[key] = true;
            }
        } else {
            // Positional argument
            result.positional.push(arg);
        }

        i++;
    }

    return result;
}

/**
 * Get a string flag value with fallback.
 */
export function getString(flags: Record<string, string | boolean>, keys: string[], fallback: string): string {
    for (const key of keys) {
        const value = flags[key];
        if (typeof value === 'string') {
            return value;
        }
    }
    return fallback;
}

/**
 * Get a numeric flag value with fallback.
 */
export function getNumber(flags: Record<string, string | boolean>, keys: string[], fallback: number): number {
    for (const key of keys) {
        const value = flags[key];
        if (typeof value === 'string') {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                return num;
            }
        }
    }
    return fallback;
}

/**
 * Check if a boolean flag is set.
 */
export function getBoolean(flags: Record<string, string | boolean>, keys: string[]): boolean {
    for (const key of keys) {
        if (flags[key] === true || flags[key] === 'true') {
            return true;
        }
    }
    return false;
}
