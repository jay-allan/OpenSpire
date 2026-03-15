import { ENTITY_INVALID } from '../../../Core/ECS/ECSConstants';
import { Trigger } from '../../../Core/ECS/Trigger';

export class PlayerTurnFinishedEvent extends Trigger {
    static readonly type: string = 'PLAYER_TURN_FINISHED_EVENT';

    public playerIndex: number = ENTITY_INVALID;
}
