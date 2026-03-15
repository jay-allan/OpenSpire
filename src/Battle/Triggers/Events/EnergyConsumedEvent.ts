import { Trigger } from '../../../Core/ECS/Trigger';

export class EnergyConsumedEvent extends Trigger {
    static readonly type: string = 'ENERGY_CONSUMED_EVENT';

    public remainingEnergy = 0;
}
