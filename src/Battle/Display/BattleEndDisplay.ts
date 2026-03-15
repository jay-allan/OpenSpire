import { EventBus } from '../../Core/EventBus';
import { BattleEndedTrigger } from '../Triggers/Phases/BattleEndedTrigger';

/**
 * Subscribes to BattleEndedTrigger and renders the battle result to the
 * console. Depends on the game model — the game model has no knowledge of
 * this class.
 */
export class BattleEndDisplay {
    private readonly _humanPlayerIndex: number;

    public constructor(humanPlayerIndex: number, eventBus: EventBus) {
        this._humanPlayerIndex = humanPlayerIndex;
        eventBus.register(
            BattleEndedTrigger.type,
            this.onBattleEnded.bind(this)
        );
    }

    private onBattleEnded(payload?: unknown): void {
        const event = payload as BattleEndedTrigger;
        const playerWon = event.winnerPlayerIndex === this._humanPlayerIndex;

        console.log('\n========================================');
        if (playerWon) {
            console.log('  Victory! The battle has ended.');
        } else {
            console.log('  Defeat. Better luck next time.');
        }
        console.log('========================================\n');
    }
}
