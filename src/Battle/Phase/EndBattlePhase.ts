import { GameState } from '../../Core/GameState';
import { Logger } from '../../Core/Logger';

export class EndBattlePhase implements GameState {
    Enter(): void {
        Logger.info('EndBattlePhase Enter');
    }

    Exit(): void {
        Logger.info('EndBattlePhase Exit');
    }

    async Run(): Promise<void> {
        Logger.info('EndBattlePhase Run');
    }
}
