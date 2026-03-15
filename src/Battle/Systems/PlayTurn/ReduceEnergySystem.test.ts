import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';
import { EnergyComponent } from '../../Components/Player/EnergyComponent';
import { EnergyConsumedEvent } from '../../Triggers/Events/EnergyConsumedEvent';
import { TurnActionTakenEvent } from '../../Triggers/Events/TurnActionTakenEvent';
import { ReduceEnergySystem } from './ReduceEnergySystem';

function dispatchTurnActionTaken(ecs: ECS, originEntityId: number): void {
    ecs.eventBus.dispatch<TurnActionTakenEvent>(TurnActionTakenEvent.type, {
        originEntityId
    });
}

let ecs: ECS;

beforeEach(() => {
    ecs = new ECS(new EventBus());
    ecs.createSystem(ReduceEnergySystem);
});

afterEach(() => {
    ecs.destroy();
});

test('Energy is reduced by 1 when TurnActionTakenEvent is dispatched', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 3;
    energy.maxEnergy = 3;

    dispatchTurnActionTaken(ecs, entity.id);

    expect(energy.energy).toBe(2);
});

test('Energy does not go below 0', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 0;
    energy.maxEnergy = 3;

    dispatchTurnActionTaken(ecs, entity.id);

    expect(energy.energy).toBe(0);
});

test('EnergyConsumedEvent is dispatched with the remaining energy', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 3;
    energy.maxEnergy = 3;

    let receivedRemaining = -1;
    ecs.eventBus.register(EnergyConsumedEvent.type, (payload) => {
        const event = payload as EnergyConsumedEvent;
        receivedRemaining = event.remainingEnergy;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(receivedRemaining).toBe(2);
});

test('EnergyConsumedEvent carries the origin entity ID', () => {
    const entity = ecs.createEntity();
    const energy = ecs.createComponent<EnergyComponent>(entity, EnergyComponent)!;
    energy.energy = 2;
    energy.maxEnergy = 2;

    let receivedOriginEntityId = -1;
    ecs.eventBus.register(EnergyConsumedEvent.type, (payload) => {
        const event = payload as EnergyConsumedEvent;
        receivedOriginEntityId = event.originEntityId;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(receivedOriginEntityId).toBe(entity.id);
});

test('No event is dispatched for an entity without an EnergyComponent', () => {
    const entity = ecs.createEntity();

    let eventFired = false;
    ecs.eventBus.register(EnergyConsumedEvent.type, () => {
        eventFired = true;
    });

    dispatchTurnActionTaken(ecs, entity.id);

    expect(eventFired).toBe(false);
});
