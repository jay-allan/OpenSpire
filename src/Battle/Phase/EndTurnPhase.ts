import { GameState } from '../../Core/GameState';
import { Logger } from '../../Core/Logger';
import { Battle } from '../Battle';

export class EndTurnPhase implements GameState {
    private readonly _battle: Battle;

    constructor(battle: Battle) {
        this._battle = battle;
    }

    Enter(): void {
        Logger.info('EndTurnPhase Enter');
    }

    Exit(): void {
        Logger.info('EndTurnPhase Exit');
    }

    async Run(): Promise<void> {
        Logger.info('EndTurnPhase Run');

        await this._battle.switchPhase(Battle.PHASE_TURN_START);
    }
}
