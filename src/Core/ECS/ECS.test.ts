import { Component } from './Component';
import { ECS } from './ECS';
import { Trigger } from './Trigger';
import { TriggerSystem } from './TriggerSystem';

let ecs: ECS;

const INITIAL_HEALTH: number = 100;
const DAMAGE: number = 10;

class HealthComponent extends Component {
    readonly type: string = 'HealthComponent';

    public health: number = INITIAL_HEALTH;
}

class DamageComponent extends Component {
    readonly type: string = 'DamageComponent';

    public damage: number = DAMAGE;
}

class DamageAllTrigger extends Trigger {
    static readonly type: string = 'DamageAllTrigger';

    public damage: number = DAMAGE;
}

class DamageAllSystem extends TriggerSystem {
    readonly triggerType: string = DamageAllTrigger.type;

    public Run(payload?: any): void {
        let data = payload as DamageAllTrigger;
        let healthComponents =
            this._ecs.getComponents<HealthComponent>(HealthComponent);

        healthComponents.forEach((component) => {
            if (component.entityId != data.originEntityId) {
                component.health -= data.damage;
            }
        });
    }
}

beforeEach(() => {
    ecs = new ECS();
});

afterEach(() => {
    ecs.destroy();
});

test('Integration', () => {
    const player = ecs.createEntity();
    ecs.createComponent<HealthComponent>(player, HealthComponent);

    const enemy = ecs.createEntity();
    ecs.createComponent<HealthComponent>(enemy, HealthComponent);

    ecs.createSystem<DamageAllSystem>(DamageAllSystem);
    ecs.eventBus.dispatch<DamageAllTrigger>(DamageAllTrigger.type, {
        originEntityId: player.id,
        damage: DAMAGE
    });

    const healthComponent: HealthComponent | undefined = ecs.getEntityComponent(
        enemy.id,
        HealthComponent
    );
    expect(healthComponent).toBeDefined();
    expect(healthComponent!.health).toBe(INITIAL_HEALTH - DAMAGE);
});

test('getEntityComponent returns component of correct type', () => {
    const player = ecs.createEntity();
    const component = ecs.createComponent<HealthComponent>(
        player,
        HealthComponent
    );
    if (!component) {
        fail('Unable to create component');
    }
    ecs.createComponent<DamageComponent>(player, DamageComponent);

    const retrievedComponent = ecs.getEntityComponent<HealthComponent>(
        player.id,
        HealthComponent
    );
    expect(retrievedComponent).toBeDefined();
    if (retrievedComponent) {
        expect(retrievedComponent.type).toBe(component.type);
    }
});
