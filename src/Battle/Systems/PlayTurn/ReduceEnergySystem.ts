import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { EnergyComponent } from '../../Components/Player/EnergyComponent';
import { EnergyConsumedEvent } from '../../Triggers/Events/EnergyConsumedEvent';
import { TurnActionTakenEvent } from '../../Triggers/Events/TurnActionTakenEvent';

/**
 * Reduces the acting entity's energy by one whenever a TurnActionTakenEvent
 * is received, then dispatches EnergyConsumedEvent with the remaining energy.
 */
export class ReduceEnergySystem extends TriggerSystem {
    readonly triggerType: string = TurnActionTakenEvent.type;

    public Run(payload?: unknown): void {
        const event = payload as TurnActionTakenEvent;
        const energy = this._ecs.getEntityComponent<EnergyComponent>(
            event.originEntityId,
            EnergyComponent
        );

        if (!energy) {
            Logger.warn(
                `Entity ${event.originEntityId} dispatched TurnActionTakenEvent but has no EnergyComponent — energy cannot be reduced.`
            );
            return;
        }

        const before = energy.energy;
        energy.energy = Math.max(0, energy.energy - 1);
        Logger.info(
            `Entity ${event.originEntityId} energy reduced: ${before} → ${energy.energy}.`
        );

        if (energy.energy === 0) {
            Logger.info(`Entity ${event.originEntityId} has no energy remaining.`);
        }

        this._ecs.eventBus.dispatch<EnergyConsumedEvent>(
            EnergyConsumedEvent.type,
            {
                originEntityId: event.originEntityId,
                remainingEnergy: energy.energy
            }
        );
    }
}
