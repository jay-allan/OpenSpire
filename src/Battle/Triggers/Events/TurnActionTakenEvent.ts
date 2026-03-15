import { Trigger } from '../../../Core/ECS/Trigger';

export class TurnActionTakenEvent extends Trigger {
    static readonly type: string = 'TURN_ACTION_TAKEN_EVENT';
}
