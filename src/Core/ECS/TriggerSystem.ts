import { ECS } from './ECS';
import { System } from './System';

/**
 * A TriggerSystem runs every time a Trigger is dispatched.
 */
export abstract class TriggerSystem extends System {
    /**
     * The event type string this system listens for. Must match the static
     * `type` field of the corresponding Trigger subclass.
     */
    protected abstract triggerType: string;

    /**
     * Reference to the ECS instance, stored during Initialize for use in Run.
     */
    protected _ecs!: ECS;

    /**
     * Registers this system on the EventBus to run whenever the trigger type
     * is dispatched.
     *
     * @param ecs The ECS instance this system belongs to
     */
    public Initialize(ecs: ECS): void {
        this._ecs = ecs;
        ecs.eventBus.register(this.triggerType, this.Run.bind(this));
    }

    /**
     * Unregisters this system from the EventBus.
     */
    public Destroy(): void {
        this._ecs.eventBus.unregister(this.triggerType, this.Run);
    }
}
