import { ENTITY_INVALID } from './ECSConstants';

export const components = new Array<Component>();

/**
 * A Component is an object that purely stores data and does not have have any
 * behaviour. Logic and behavior is handled by Systems.
 */
export abstract class Component {
    /**
     * Unique string identifier for this component type. Must be overridden in
     * each concrete subclass and should match the class name by convention.
     */
    abstract readonly type: string;

    /**
     * ID of the entity this component is attached to. Set automatically by
     * ComponentManager when the component is added to an entity.
     */
    public entityId: number = ENTITY_INVALID;
}
