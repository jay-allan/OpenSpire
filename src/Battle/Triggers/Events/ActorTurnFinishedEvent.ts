import { Trigger } from '../../../Core/ECS/Trigger';

export class ActorTurnFinishedEvent extends Trigger {
    static readonly type: string = 'ACTOR_TURN_FINISHED_EVENT';
}
