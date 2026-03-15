import type { Battle } from '../../Battle';
import { Actor } from '../../Actor/Actor';
import { ActorManager } from '../../ActorModel';
import { RemoveDeadActorSystem } from './RemoveDeadActorSystem';
import { CheckBattleEndSystem } from './CheckBattleEndSystem';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';
import { BattleEndedTrigger } from '../../Triggers/Phases/BattleEndedTrigger';
import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';

class MockActor extends Actor {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async playTurn(_battle: Battle): Promise<void> {}
}

function dispatchActorDies(ecs: ECS, targetEntityId: number): void {
    ecs.eventBus.dispatch<ActorDiesEvent>(ActorDiesEvent.type, {
        originEntityId: -1,
        targetEntityId
    });
}

let ecs: ECS;
let actorManager: ActorManager;

beforeEach(() => {
    ecs = new ECS(new EventBus());
    actorManager = new ActorManager();

    // RemoveDeadActorSystem must be registered first so actors are already
    // removed when CheckBattleEndSystem runs.
    const remove = ecs.createSystem(RemoveDeadActorSystem);
    remove.setActorManager(actorManager);

    const check = ecs.createSystem(CheckBattleEndSystem);
    check.setActorManager(actorManager);
});

afterEach(() => {
    ecs.destroy();
});

test('BattleEndedTrigger is dispatched when a player has no remaining actors', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    let eventDispatched = false;
    ecs.eventBus.register(BattleEndedTrigger.type, () => {
        eventDispatched = true;
    });

    dispatchActorDies(ecs, actor1.entityId);

    expect(eventDispatched).toBe(true);
});

test('BattleEndedTrigger is not dispatched when all players still have actors', () => {
    const actor0a = new MockActor(0, 0);
    const actor0b = new MockActor(1, 0);
    const actor1 = new MockActor(2, 1);
    actorManager.addActor(0, actor0a);
    actorManager.addActor(0, actor0b);
    actorManager.addActor(1, actor1);

    let eventDispatched = false;
    ecs.eventBus.register(BattleEndedTrigger.type, () => {
        eventDispatched = true;
    });

    dispatchActorDies(ecs, actor0a.entityId);

    expect(eventDispatched).toBe(false);
});

test('BattleEndedTrigger carries the winning player index', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    let winnerPlayerIndex = -1;
    ecs.eventBus.register(BattleEndedTrigger.type, (payload) => {
        const event = payload as BattleEndedTrigger;
        winnerPlayerIndex = event.winnerPlayerIndex;
    });

    dispatchActorDies(ecs, actor1.entityId);

    expect(winnerPlayerIndex).toBe(0);
});
