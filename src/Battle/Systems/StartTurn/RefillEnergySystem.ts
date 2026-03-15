import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { Logger } from '../../../Core/Logger';
import { EnergyComponent } from '../../Components/Player/EnergyComponent';
import { TurnStartedTrigger } from '../../Triggers/Phases/TurnStartedTrigger';

export class RefillEnergySystem extends TriggerSystem {
    readonly triggerType: string = TurnStartedTrigger.type;

    public Run(payload?: any): void {
        Logger.info('RefillEnergySystem triggered');

        const playerEntityId = (payload as TurnStartedTrigger).originEntityId;
        const energyComponents =
            this._ecs.getComponents<EnergyComponent>(EnergyComponent);

        const found = energyComponents.some((component) => {
            if (component.entityId == playerEntityId) {
                component.energy = component.maxEnergy;
                Logger.info(
                    `Refilled energy for entity ${playerEntityId} to ${component.energy}/${component.maxEnergy}.`
                );
                return true;
            }
        });

        if (!found) {
            Logger.info(
                `Entity ${playerEntityId} has no EnergyComponent — skipping energy refill.`
            );
        }
    }
}
