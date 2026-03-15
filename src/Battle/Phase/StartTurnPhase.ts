import { GameState } from '../../Core/GameState';
import { Logger } from '../../Core/Logger';
import { Battle } from '../Battle';
import { TurnStartedTrigger } from '../Triggers/Phases/TurnStartedTrigger';

export class StartTurnPhase implements GameState {
    private readonly _battle: Battle;

    constructor(battle: Battle) {
        this._battle = battle;
    }

    Enter(): void {
        Logger.info('StartTurnPhase Enter');
    }

    Exit(): void {
        Logger.info('StartTurnPhase Exit');
    }

    async Run(): Promise<void> {
        Logger.info('StartTurnPhase Run');

        const currentActor = this._battle.actorManager.currentActor;
        Logger.info(
            `Turn starting for entity ${currentActor.entityId} (player ${currentActor.playerIndex}).`
        );

        this._battle.dispatchEvent<TurnStartedTrigger>(
            TurnStartedTrigger.type,
            {
                originEntityId: currentActor.entityId
            }
        );

        await this._battle.switchPhase(Battle.PHASE_TURN_PLAY);
    }
}
