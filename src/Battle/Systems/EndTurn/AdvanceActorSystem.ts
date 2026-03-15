import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { ActorManager } from '../../ActorModel';
import { ActorTurnFinishedEvent } from '../../Triggers/Events/ActorTurnFinishedEvent';
import { PlayerTurnFinishedEvent } from '../../Triggers/Events/PlayerTurnFinishedEvent';

/**
 * Advances turn order within the current player's actor group whenever an
 * actor finishes their turn. When the last actor in the group has gone,
 * dispatches PlayerTurnFinishedEvent so PlayerTurnSwitchSystem can hand
 * control to the next player.
 */
export class AdvanceActorSystem extends TriggerSystem {
    readonly triggerType: string = ActorTurnFinishedEvent.type;

    private _actorManager!: ActorManager;

    public setActorManager(actorManager: ActorManager): void {
        this._actorManager = actorManager;
    }

    public Run(payload?: unknown): void {
        // A player having no living actors means the battle is already over.
        // Advancing turn order past this point would corrupt state (e.g.
        // accessing an empty actor list), so bail out immediately.
        for (let i = 0; i < this._actorManager.playerCount; i++) {
            if (!this._actorManager.hasLivingActors(i)) {
                Logger.info(
                    `Player ${i} has no living actors — battle has ended, skipping turn advance.`
                );
                return;
            }
        }

        const event = payload as ActorTurnFinishedEvent;
        const playerIndex = this._actorManager.currentPlayerIndex;
        const currentGroup = this._actorManager.getActorsForPlayer(playerIndex);
        const isLastInGroup =
            this._actorManager.currentActorIndex === currentGroup.length - 1;

        Logger.info(
            `Actor ${event.originEntityId} finished their turn ` +
                `(player ${playerIndex}, actor ${this._actorManager.currentActorIndex}/${currentGroup.length - 1}).`
        );

        if (isLastInGroup) {
            Logger.info(
                `All actors for player ${playerIndex} have gone — dispatching PlayerTurnFinishedEvent.`
            );
            this._ecs.eventBus.dispatch<PlayerTurnFinishedEvent>(
                PlayerTurnFinishedEvent.type,
                {
                    originEntityId: event.originEntityId,
                    playerIndex
                }
            );
        } else {
            this._actorManager.currentActorIndex++;
            Logger.info(
                `Advancing to actor ${this._actorManager.currentActorIndex} for player ${playerIndex}.`
            );
        }
    }
}
