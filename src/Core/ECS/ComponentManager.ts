import { Component } from './Component';

/**
 * ComponentManager is responsible for storing and retrieving components.
 *
 * Components are stored in a two-level map:
 *   component type → entity ID → component instance
 *
 * This gives O(1) lookups for both:
 *  - All components of a given type (used by systems that process every entity)
 *  - A specific component on a specific entity
 */
export class ComponentManager {
    private _components: Map<string, Map<number, Component>> = new Map();

    /**
     * Adds a component to the given entity.
     *
     * @param entityId ID of the entity to attach the component to
     * @param component Component instance to add
     * @returns The component if it was added, undefined if the entity already
     *          has a component of this type
     */
    public add<T extends Component>(
        entityId: number,
        component: T
    ): T | undefined {
        if (!this._components.has(component.type)) {
            this._components.set(component.type, new Map());
        }

        const bucket = this._components.get(component.type)!;
        if (bucket.has(entityId)) {
            return undefined;
        }

        component.entityId = entityId;
        bucket.set(entityId, component);

        return component;
    }

    /**
     * Returns the component of the given type belonging to entityId,
     * or undefined if the entity does not have such a component.
     *
     * @param entityId ID of the entity to look up
     * @param type Constructor of the component type to retrieve
     */
    public get<T extends Component>(
        entityId: number,
        type: new () => T
    ): T | undefined {
        const key = new type().type;
        return this._components.get(key)?.get(entityId) as T | undefined;
    }

    /**
     * Returns all components of the given type across all entities.
     *
     * @param type Constructor of the component type to retrieve
     * @returns Array of all components of the given type, empty if none exist
     */
    public getAll<T extends Component>(type: new () => T): Array<T> {
        const key = new type().type;
        const bucket = this._components.get(key);
        return bucket ? (Array.from(bucket.values()) as Array<T>) : [];
    }

    /**
     * Removes all stored components.
     */
    public clear(): void {
        this._components.clear();
    }
}
