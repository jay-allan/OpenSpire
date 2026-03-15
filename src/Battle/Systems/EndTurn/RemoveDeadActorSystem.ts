import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { ActorManager } from '../../ActorModel';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';

/**
 * Removes a dead actor from the ActorManager whenever an ActorDiesEvent is
 * dispatched. Must be registered before CheckBattleEndSystem so that the
 * ActorManager reflects the updated state when the battle-end check runs.
 */
export class RemoveDeadActorSystem extends TriggerSystem {
    readonly triggerType: string = ActorDiesEvent.type;

    private _actorManager!: ActorManager;

    public setActorManager(actorManager: ActorManager): void {
        this._actorManager = actorManager;
    }

    public Run(payload?: unknown): void {
        const event = payload as ActorDiesEvent;
        Logger.info(
            `Actor ${event.targetEntityId} died (origin: entity ${event.originEntityId}). Removing from ActorManager.`
        );
        this._actorManager.removeActor(event.targetEntityId);
        Logger.info(`Actor ${event.targetEntityId} removed from ActorManager.`);
    }
}
