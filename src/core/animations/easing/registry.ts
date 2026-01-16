import type { EasingFunction } from './types';

/**
 * Registry for custom easing functions.
 * Allows users to register and retrieve custom easings by name.
 */
const easingRegistry = new Map<string, EasingFunction>();

/** @throws Error if an easing with the given name already exists. */
export function registerEasing(name: string, fn: EasingFunction): void {
    if (easingRegistry.has(name)) {
        throw new Error(`Easing "${name}" is already registered.`);
    }
    easingRegistry.set(name, fn);
}

export function getEasing(name: string): EasingFunction | undefined {
    return easingRegistry.get(name);
}

export function hasEasing(name: string): boolean {
    return easingRegistry.has(name);
}

export function unregisterEasing(name: string): boolean {
    return easingRegistry.delete(name);
}

/** Clears all registered custom easings (useful for testing). */
export function clearRegistry(): void {
    easingRegistry.clear();
}
