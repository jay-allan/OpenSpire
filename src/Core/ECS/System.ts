import { ECS } from './ECS';

/**
 * A System is used to transform data stored on the components.
 */
export abstract class System {
    /**
     * Called once when the system is registered with the ECS. Use this to
     * subscribe to events or perform any one-time setup.
     *
     * @param ecs The ECS instance this system belongs to
     */
    public abstract Initialize(ecs: ECS): void;

    /**
     * Called when the ECS is destroyed. Use this to unsubscribe from events
     * and release any resources acquired during Initialize.
     */
    public abstract Destroy(): void;

    /**
     * Executes the system's logic.
     *
     * @param payload Optional data passed to the system, typically the trigger
     *                that caused this system to run
     */
    public abstract Run(payload?: any): void;
}
