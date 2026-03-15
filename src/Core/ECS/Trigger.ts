import { ENTITY_INVALID } from './ECSConstants';

/**
 * A Trigger is an event dispatched via an event bus.
 */
export abstract class Trigger {
    /**
     * Unique string identifier for this trigger type. Must be overridden as a
     * static field in each concrete subclass and passed to EventBus.dispatch.
     */
    static readonly type: string;

    /**
     * ID of the entity that originated this trigger. Defaults to ENTITY_INVALID
     * when the trigger has no meaningful source entity.
     */
    public originEntityId: number = ENTITY_INVALID;
}
