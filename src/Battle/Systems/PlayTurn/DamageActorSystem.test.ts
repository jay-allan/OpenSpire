import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';
import { BlockComponent } from '../../Components/Actor/BlockComponent';
import { HealthComponent } from '../../Components/Actor/HealthComponent';
import { DamageActorAction } from '../../Triggers/Actions/DamageActorAction';
import { ActorDamagedEvent } from '../../Triggers/Events/ActorDamagedEvent';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';
import {
    DamageActorSystem,
    DamageCalculationResult
} from './DamageActorSystem';

let ecs: ECS;

beforeEach(() => {
    ecs = new ECS(new EventBus());
});

afterEach(() => {
    ecs.destroy();
});

test('Entity receives damage from other entity', () => {
    const INITIAL_HEALTH = 10;
    const DAMAGE_DEALT = 5;

    const damageDealer = ecs.createEntity();
    const damageReceiver = ecs.createEntity();
    const healthComponent = ecs.createComponent<HealthComponent>(
        damageReceiver,
        HealthComponent
    );
    if (!healthComponent) {
        fail();
    }
    healthComponent.health = INITIAL_HEALTH;
    healthComponent.maxHealth = INITIAL_HEALTH;

    ecs.createSystem<DamageActorSystem>(DamageActorSystem);

    expect(healthComponent.health).toBe(INITIAL_HEALTH);
    ecs.eventBus.dispatch<DamageActorAction>(DamageActorAction.type, {
        originEntityId: damageDealer.id,
        targetEntityId: damageReceiver.id,
        damage: DAMAGE_DEALT
    });
    expect(healthComponent.health).toBe(INITIAL_HEALTH - DAMAGE_DEALT);
});

test('Dispatches ActorDamagedEvent if entity receives damage', () => {
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 10;
    const DAMAGE_DEALT = 15;

    const damageDealer = ecs.createEntity();
    const damageReceiver = ecs.createEntity();
    const healthComponent = ecs.createComponent<HealthComponent>(
        damageReceiver,
        HealthComponent
    );
    if (!healthComponent) {
        fail('Unable to create component');
    }
    healthComponent.health = INITIAL_HEALTH;
    healthComponent.maxHealth = INITIAL_HEALTH;

    const blockComponent = ecs.createComponent<BlockComponent>(
        damageReceiver,
        BlockComponent
    );
    if (!blockComponent) {
        fail('Unable to create component');
    }
    blockComponent.block = INITIAL_BLOCK;

    ecs.createSystem<DamageActorSystem>(DamageActorSystem);

    let damageEventDispatched = false;
    let damageToBlock = 0;
    let damageToHealth = 0;
    ecs.eventBus.register(ActorDamagedEvent.type, (payload) => {
        const data = payload as ActorDamagedEvent;
        if (
            data.originEntityId == damageDealer.id &&
            data.targetEntityId == damageReceiver.id
        ) {
            damageEventDispatched = true;
            damageToBlock = data.damageToBlock;
            damageToHealth = data.damageToHealth;
        }
    });
    ecs.eventBus.dispatch<DamageActorAction>(DamageActorAction.type, {
        originEntityId: damageDealer.id,
        targetEntityId: damageReceiver.id,
        damage: DAMAGE_DEALT
    });

    expect(damageEventDispatched).toBe(true);
    expect(damageToBlock).toBe(INITIAL_BLOCK);
    expect(damageToHealth).toBe(INITIAL_HEALTH + INITIAL_BLOCK - DAMAGE_DEALT);
});

test('Dispatches ActorDiesEvent if entity dies from received damage', () => {
    const INITIAL_HEALTH = 10;
    const DAMAGE_DEALT = 10;

    const damageDealer = ecs.createEntity();
    const damageReceiver = ecs.createEntity();
    const healthComponent = ecs.createComponent<HealthComponent>(
        damageReceiver,
        HealthComponent
    );
    if (!healthComponent) {
        fail();
    }
    healthComponent.health = INITIAL_HEALTH;
    healthComponent.maxHealth = INITIAL_HEALTH;

    ecs.createSystem<DamageActorSystem>(DamageActorSystem);

    let dieEventDispatched = false;
    ecs.eventBus.register(ActorDiesEvent.type, (payload) => {
        const data = payload as ActorDiesEvent;
        if (
            data.originEntityId == damageDealer.id &&
            data.targetEntityId == damageReceiver.id
        ) {
            dieEventDispatched = true;
        }
    });
    ecs.eventBus.dispatch<DamageActorAction>(DamageActorAction.type, {
        originEntityId: damageDealer.id,
        targetEntityId: damageReceiver.id,
        damage: DAMAGE_DEALT
    });
    expect(dieEventDispatched).toBe(true);
});

test('Damage calculation: damage is reduced by amount of block', () => {
    const system = new DamageActorSystem();
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 5;
    const DAMAGE = 7;

    const result: DamageCalculationResult = system.calculateDamage(
        INITIAL_HEALTH,
        INITIAL_BLOCK,
        DAMAGE
    );
    expect(result.damageToHealth).toBe(DAMAGE - INITIAL_BLOCK);
});

test('Damage calculation: block remains if damage is below block', () => {
    const system = new DamageActorSystem();
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 10;
    const DAMAGE = 7;

    const result: DamageCalculationResult = system.calculateDamage(
        INITIAL_HEALTH,
        INITIAL_BLOCK,
        DAMAGE
    );
    expect(result.remainingBlock).toBe(Math.max(0, INITIAL_BLOCK - DAMAGE));
    expect(result.remainingHealth).toBe(Math.max(0, INITIAL_HEALTH));
});

test('Damage calculation: block and health are 0 on overwhelming damage', () => {
    const system = new DamageActorSystem();
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 10;
    const DAMAGE = 30;

    const result: DamageCalculationResult = system.calculateDamage(
        INITIAL_HEALTH,
        INITIAL_BLOCK,
        DAMAGE
    );
    expect(result.remainingBlock).toBe(0);
    expect(result.remainingHealth).toBe(0);
});

test('Damage calculation: health is reduced by damage', () => {
    const system = new DamageActorSystem();
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 0;
    const DAMAGE = 5;

    const result: DamageCalculationResult = system.calculateDamage(
        INITIAL_HEALTH,
        INITIAL_BLOCK,
        DAMAGE
    );
    expect(result.remainingHealth).toBe(INITIAL_HEALTH - DAMAGE);
});

test('Damage calculation: only block is reduced by damage lower than block', () => {
    const system = new DamageActorSystem();
    const INITIAL_HEALTH = 10;
    const INITIAL_BLOCK = 10;
    const DAMAGE = 5;

    const result: DamageCalculationResult = system.calculateDamage(
        INITIAL_HEALTH,
        INITIAL_BLOCK,
        DAMAGE
    );
    expect(result.remainingBlock).toBe(INITIAL_BLOCK - DAMAGE);
    expect(result.remainingHealth).toBe(INITIAL_HEALTH);
});
