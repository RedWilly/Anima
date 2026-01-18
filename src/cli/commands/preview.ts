import { render } from './render';

/**
 * Implementation of the 'preview' command.
 * Shorthand for rendering with 'preview' quality.
 */
export async function preview(file: string, options: any): Promise<void> {
    await render(file, {
        ...options,
        quality: 'preview',
    });
}
