import { ECS } from '../../../Core/ECS/ECS';
import { EnergyComponent } from '../../Components/Player/EnergyComponent';
import { TurnStartedTrigger } from '../../Triggers/Phases/TurnStartedTrigger';
import { RefillEnergySystem } from './RefillEnergySystem';

let ecs: ECS;

beforeEach(() => {
    ecs = new ECS();
});

afterEach(() => {
    ecs.destroy();
});

test('Energy is refilled', () => {
    const TARGET_ENERGY = 10;

    const entity = ecs.createEntity();
    const energyComponent = ecs.createComponent<EnergyComponent>(
        entity,
        EnergyComponent
    );
    if (!energyComponent) {
        fail('Unable to create component');
    }
    energyComponent.energy = 0;
    energyComponent.maxEnergy = TARGET_ENERGY;

    ecs.createSystem<RefillEnergySystem>(RefillEnergySystem);
    expect(energyComponent.energy).toBe(0);
    ecs.eventBus.dispatch<TurnStartedTrigger>(TurnStartedTrigger.type, {
        originEntityId: entity.id
    });
    expect(energyComponent.energy).toBe(TARGET_ENERGY);
});
