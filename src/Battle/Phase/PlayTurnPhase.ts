import { GameState } from '../../Core/GameState';
import { Logger } from '../../Core/Logger';
import { Battle } from '../Battle';

export class PlayTurnPhase implements GameState {
    private readonly _battle: Battle;

    constructor(battle: Battle) {
        this._battle = battle;
    }

    Enter(): void {
        Logger.info('PlayTurnPhase Enter');
    }

    Exit(): void {
        Logger.info('PlayTurnPhase Exit');
    }

    async Run(): Promise<void> {
        Logger.info('PlayTurnPhase Run');

        const actor = this._battle.actorManager.currentActor;
        Logger.info(
            `Playing turn for entity ${actor.entityId} (player ${actor.playerIndex}).`
        );
        await actor.playTurn(this._battle);

        if (this._battle.isBattleOver) {
            Logger.info('Battle is over — switching to PHASE_BATTLE_END.');
            await this._battle.switchPhase(Battle.PHASE_BATTLE_END);
        } else {
            await this._battle.switchPhase(Battle.PHASE_TURN_END);
        }
    }
}
