import { Entity } from './Entity';
import { Component } from './Component';
import { ComponentManager } from './ComponentManager';
import { EventBus } from '../EventBus';
import { System } from './System';
import { Logger } from '../Logger';

/**
 * Simple Entity Component System (ECS)
 *
 * The basic idea of this pattern is to move from defining application
 * entities using a class hierarchy to using composition in a Data
 * Oriented Programming paradigm. (More info on wikipedia). Programming
 * with an ECS can result in code that is more efficient and easier to
 * extend over time.
 *
 * Some common terms within ECS engines are:
 *  * Entity: an object with a unique ID that can have multiple components
 *      attached to it.
 *  * Component: properties of an entity, ex: hit points. Only data is only
 *      stored in components.
 *  * System: performs the actual work within an application by processing
 *      entities and modifying their components.
 *
 * The usual workflow when building an ECS-based application is:
 *  * Create the components that shape the data you need to use in your
 *      application.
 *  * Create entities and attach components to them.
 *  * Create the systems that will use these components to read and transform
 *      the data of these entities.
 *  * Execute systems based on criteria, e.g. each frame or on an event.
 *
 * The peformance benefits of implementing an ECS for Typescript/JavaScript
 * can be discussed, but I chose this pattern since I like how it enforces
 * a certain structure to your code while making it easy to extend and test.
 *
 * This article provides a good first overview if you are new to ECS:
 * https://medium.com/ingeniouslysimple/entities-components-and-systems-89c31464240d
 */
export class ECS {
    private _eventBus: EventBus;
    private _entities: Map<number, Entity> = new Map<number, Entity>();
    private _componentManager: ComponentManager = new ComponentManager();
    private _systems: Array<System> = new Array<System>();
    private _nextEntityId = 0;

    /**
     * @param eventBus Optional EventBus to use for dispatching triggers.
     *                 If omitted, a new EventBus is created internally.
     */
    public constructor(eventBus?: EventBus) {
        this._eventBus = eventBus ?? new EventBus();
    }

    /**
     * The EventBus used to dispatch and receive triggers between systems.
     */
    public get eventBus(): EventBus {
        return this._eventBus;
    }

    /**
     * Creates a new entity with a unique ID and registers it with the ECS.
     *
     * @returns The newly created Entity
     */
    public createEntity(): Entity {
        const entity: Entity = new Entity();
        entity.id = this._nextEntityId++;
        this._entities.set(entity.id, entity);

        return entity;
    }

    /**
     * Returns the entity with the given ID, or undefined if no such entity exists.
     *
     * @param entityId ID of the entity to look up
     */
    public getEntity(entityId: number): Entity | undefined {
        return this._entities.get(entityId);
    }

    /**
     * Creates a new component of the given type and attaches it to the entity.
     * Each entity may only have one component of any given type.
     *
     * @param entity Entity to attach the component to
     * @param type Constructor of the component type to create
     * @returns The new component, or undefined if the entity already has a
     *          component of this type
     */
    public createComponent<T extends Component>(
        entity: Entity,
        type: new () => T
    ): T | undefined {
        const component = this._componentManager.add<T>(entity.id, new type());

        if (!component) {
            Logger.warn(
                `Entity ID ${entity.id} already has component of this type`
            );
        }

        return component;
    }

    /**
     * Returns _all_ existing components (across entity boundaries) of type T.
     *
     * @param type Component type
     * @returns All components of given type
     */
    public getComponents<T extends Component>(type: new () => T): Array<T> {
        return this._componentManager.getAll<T>(type);
    }

    /**
     * Returns the component of type T belonging to the given entity,
     * or undefined if the entity does not have such a component.
     *
     * @param entityId Entity to retrieve the component from
     * @param type Type of component to retrieve
     */
    public getEntityComponent<T extends Component>(
        entityId: number,
        type: new () => T
    ): T | undefined {
        return this._componentManager.get<T>(entityId, type);
    }

    /**
     * Creates a new instance of given system T and registers it for receiving
     * updates.
     *
     * @param type Type of system to be created
     * @returns New System instance
     */
    public createSystem<T extends System>(type: new () => T): T {
        const system: T = new type();

        system.Initialize(this);
        this._systems.push(system);

        return system;
    }

    /**
     * Removes all references to existing entities, systems, and components.
     * Notifies Systems to clean up.
     */
    public destroy(): void {
        this._entities.clear();
        this._componentManager.clear();

        this._systems.forEach((system) => {
            system.Destroy();
        });
        this._systems.length = 0;
    }
}
