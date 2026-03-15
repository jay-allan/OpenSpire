import { ENTITY_INVALID } from './ECSConstants';

/**
 * An entity is an object with a unique ID. Its purpose is to group
 * components together. Components themselves are stored and managed
 * by the ComponentManager.
 */
export class Entity {
    /**
     * Unique identifier for this entity, assigned by the ECS on creation.
     */
    public id: number = ENTITY_INVALID;
}
