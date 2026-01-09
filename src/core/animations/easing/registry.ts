import type { EasingFunction } from './types';

/**
 * Registry for custom easing functions.
 * Allows users to register and retrieve custom easings by name.
 */
const easingRegistry = new Map<string, EasingFunction>();

/**
 * Registers a custom easing function.
 * @param name The name to register the easing under.
 * @param fn The easing function to register.
 * @throws Error if an easing with the given name already exists.
 */
export function registerEasing(name: string, fn: EasingFunction): void {
    if (easingRegistry.has(name)) {
        throw new Error(`Easing "${name}" is already registered.`);
    }
    easingRegistry.set(name, fn);
}

/**
 * Retrieves a registered easing function by name.
 * @param name The name of the easing to retrieve.
 * @returns The easing function, or undefined if not found.
 */
export function getEasing(name: string): EasingFunction | undefined {
    return easingRegistry.get(name);
}

/**
 * Checks if an easing function is registered.
 * @param name The name to check.
 * @returns True if the easing exists.
 */
export function hasEasing(name: string): boolean {
    return easingRegistry.has(name);
}

/**
 * Removes a registered easing function.
 * @param name The name of the easing to remove.
 * @returns True if the easing was removed, false if it didn't exist.
 */
export function unregisterEasing(name: string): boolean {
    return easingRegistry.delete(name);
}

/**
 * Clears all registered custom easings.
 * Useful for testing.
 */
export function clearRegistry(): void {
    easingRegistry.clear();
}
