import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { ActorManager } from '../../ActorModel';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';
import { BattleEndedTrigger } from '../../Triggers/Phases/BattleEndedTrigger';

/**
 * Checks whether the battle has ended after every ActorDiesEvent. If any
 * player side has no remaining actors, dispatches a BattleEndedTrigger
 * carrying the index of the winning player. Must be registered after
 * RemoveDeadActorSystem so the ActorManager is already up to date.
 */
export class CheckBattleEndSystem extends TriggerSystem {
    readonly triggerType: string = ActorDiesEvent.type;

    private _actorManager!: ActorManager;

    public setActorManager(actorManager: ActorManager): void {
        this._actorManager = actorManager;
    }

    public Run(): void {
        for (let i = 0; i < this._actorManager.playerCount; i++) {
            if (!this._actorManager.hasLivingActors(i)) {
                Logger.info(
                    `Player ${i} has no remaining actors — battle is over.`
                );
                const winnerPlayerIndex = this.findWinner();
                if (winnerPlayerIndex === -1) {
                    Logger.warn(
                        'No winner could be determined — all players have zero actors.'
                    );
                } else {
                    Logger.info(`Player ${winnerPlayerIndex} wins the battle.`);
                }
                this._ecs.eventBus.dispatch<BattleEndedTrigger>(
                    BattleEndedTrigger.type,
                    { originEntityId: -1, winnerPlayerIndex }
                );
                return;
            }
        }
        Logger.info('Battle continues — all players still have living actors.');
    }

    private findWinner(): number {
        for (let i = 0; i < this._actorManager.playerCount; i++) {
            if (this._actorManager.hasLivingActors(i)) {
                return i;
            }
        }
        return -1;
    }
}
