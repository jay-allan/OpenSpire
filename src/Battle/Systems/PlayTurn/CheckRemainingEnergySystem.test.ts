import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';
import { EnergyComponent } from '../../Components/Player/EnergyComponent';
import { ActorTurnFinishedEvent } from '../../Triggers/Events/ActorTurnFinishedEvent';
import { EnergyConsumedEvent } from '../../Triggers/Events/EnergyConsumedEvent';
import { TurnActionTakenEvent } from '../../Triggers/Events/TurnActionTakenEvent';
import { CheckRemainingEnergySystem } from './CheckRemainingEnergySystem';
import { ReduceEnergySystem } from './ReduceEnergySystem';

function dispatchTurnActionTaken(ecs: ECS, originEntityId: number): void {
    ecs.eventBus.dispatch<TurnActionTakenEvent>(TurnActionTakenEvent.type, {
        originEntityId
    });
}

let ecs: ECS;

beforeEach(() => {
    ecs = new ECS(new EventBus());
    // ReduceEnergySystem must be registered first so energy is already
    // reduced when CheckRemainingEnergySystem runs.
    ecs.createSystem(ReduceEnergySystem);
    ecs.createSystem(CheckRemainingEnergySystem);
});

afterEach(() => {
    ecs.destroy();
});

test('ActorTurnFinishedEvent is dispatched when energy reaches 0', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 1;
    energy.maxEnergy = 3;

    let eventFired = false;
    ecs.eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventFired = true;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(eventFired).toBe(true);
});

test('ActorTurnFinishedEvent is not dispatched when energy is still above 0', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 3;
    energy.maxEnergy = 3;

    let eventFired = false;
    ecs.eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventFired = true;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(eventFired).toBe(false);
});

test('ActorTurnFinishedEvent carries the entity ID of the actor whose energy ran out', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 1;
    energy.maxEnergy = 3;

    let receivedOriginEntityId = -1;
    ecs.eventBus.register(ActorTurnFinishedEvent.type, (payload) => {
        const event = payload as ActorTurnFinishedEvent;
        receivedOriginEntityId = event.originEntityId;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(receivedOriginEntityId).toBe(entity.id);
});

test('ActorTurnFinishedEvent is dispatched once per EnergyConsumedEvent with 0 remaining', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 1;
    energy.maxEnergy = 3;

    let eventCount = 0;
    ecs.eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventCount++;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(eventCount).toBe(1);
});

test('EnergyConsumedEvent with remaining > 0 does not dispatch ActorTurnFinishedEvent', () => {
    let eventFired = false;
    ecs.eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventFired = true;
    });

    ecs.eventBus.dispatch<EnergyConsumedEvent>(EnergyConsumedEvent.type, {
        originEntityId: 0,
        remainingEnergy: 2
    });

    expect(eventFired).toBe(false);
});
