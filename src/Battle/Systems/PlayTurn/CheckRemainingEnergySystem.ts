import { Logger } from '../../../Core/Logger';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { ActorTurnFinishedEvent } from '../../Triggers/Events/ActorTurnFinishedEvent';
import { EnergyConsumedEvent } from '../../Triggers/Events/EnergyConsumedEvent';

/**
 * Ends the current actor's turn when their energy reaches zero after an
 * action. Dispatches ActorTurnFinishedEvent so the normal turn-advance
 * pipeline takes over.
 */
export class CheckRemainingEnergySystem extends TriggerSystem {
    readonly triggerType: string = EnergyConsumedEvent.type;

    public Run(payload?: unknown): void {
        const event = payload as EnergyConsumedEvent;

        if (event.remainingEnergy === 0) {
            Logger.info(
                `Entity ${event.originEntityId} is out of energy — ending their turn automatically.`
            );
            this._ecs.eventBus.dispatch<ActorTurnFinishedEvent>(
                ActorTurnFinishedEvent.type,
                { originEntityId: event.originEntityId }
            );
        } else {
            Logger.info(
                `Entity ${event.originEntityId} has ${event.remainingEnergy} energy remaining.`
            );
        }
    }
}
