/**
 * Registry for custom serializers to support user-defined VMobject subclasses.
 */

import type { CustomSerializer, SerializedMobject } from './types';

const registry = new Map<string, CustomSerializer<unknown>>();

/**
 * Register a custom serializer for a type.
 * @param serializer The serializer implementation
 */
export function registerSerializer<T>(serializer: CustomSerializer<T>): void {
    registry.set(serializer.typeName, serializer as CustomSerializer<unknown>);
}

/**
 * Get a registered serializer by type name.
 * @param typeName The type name to look up
 * @returns The serializer or undefined if not registered
 */
export function getSerializer(typeName: string): CustomSerializer<unknown> | undefined {
    return registry.get(typeName);
}

/**
 * Check if a serializer is registered for a type.
 * @param typeName The type name to check
 */
export function hasSerializer(typeName: string): boolean {
    return registry.has(typeName);
}

/**
 * Unregister a serializer.
 * @param typeName The type name to unregister
 */
export function unregisterSerializer(typeName: string): boolean {
    return registry.delete(typeName);
}

/**
 * Clear all registered serializers.
 */
export function clearSerializerRegistry(): void {
    registry.clear();
}
