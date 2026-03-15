import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { ActorManager } from '../../ActorModel';
import { PlayerTurnFinishedEvent } from '../../Triggers/Events/PlayerTurnFinishedEvent';

/**
 * Switches control to the next player and their first actor when all actors
 * for the current player have finished their turns.
 */
export class PlayerTurnSwitchSystem extends TriggerSystem {
    readonly triggerType: string = PlayerTurnFinishedEvent.type;

    private _actorManager!: ActorManager;

    public setActorManager(actorManager: ActorManager): void {
        this._actorManager = actorManager;
    }

    public Run(payload?: unknown): void {
        const event = payload as PlayerTurnFinishedEvent;
        this._actorManager.currentActorIndex = 0;
        this._actorManager.currentPlayerIndex =
            (this._actorManager.currentPlayerIndex + 1) %
            this._actorManager.playerCount;
        Logger.info(
            `Player ${event.playerIndex} turn ended. ` +
                `Player ${this._actorManager.currentPlayerIndex} turn begins.`
        );
    }
}
