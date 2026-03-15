import { Trigger } from '../../../Core/ECS/Trigger';

export class BattleEndedTrigger extends Trigger {
    static readonly type: string = 'BATTLE_ENDED_TRIGGER';

    public winnerPlayerIndex = -1;
}
