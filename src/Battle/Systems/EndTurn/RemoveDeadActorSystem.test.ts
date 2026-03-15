import type { Battle } from '../../Battle';
import { Actor } from '../../Actor/Actor';
import { ActorManager } from '../../ActorModel';
import { RemoveDeadActorSystem } from './RemoveDeadActorSystem';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';
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
    const system = ecs.createSystem(RemoveDeadActorSystem);
    system.setActorManager(actorManager);
});

afterEach(() => {
    ecs.destroy();
});

test('Dead actor is removed from the ActorManager', () => {
    const actor = new MockActor(0, 0);
    actorManager.addActor(0, actor);

    expect(actorManager.getActorsForPlayer(0)).toContain(actor);

    dispatchActorDies(ecs, actor.entityId);

    expect(actorManager.getActorsForPlayer(0)).not.toContain(actor);
});

test('Only the dead actor is removed when multiple actors share a player', () => {
    const actorA = new MockActor(0, 0);
    const actorB = new MockActor(1, 0);
    actorManager.addActor(0, actorA);
    actorManager.addActor(0, actorB);

    dispatchActorDies(ecs, actorA.entityId);

    expect(actorManager.getActorsForPlayer(0)).not.toContain(actorA);
    expect(actorManager.getActorsForPlayer(0)).toContain(actorB);
});

test('Player has no living actors after their only actor dies', () => {
    const actor = new MockActor(0, 0);
    actorManager.addActor(0, actor);

    dispatchActorDies(ecs, actor.entityId);

    expect(actorManager.hasLivingActors(0)).toBe(false);
});

test('Player still has living actors after one of several dies', () => {
    const actorA = new MockActor(0, 0);
    const actorB = new MockActor(1, 0);
    actorManager.addActor(0, actorA);
    actorManager.addActor(0, actorB);

    dispatchActorDies(ecs, actorA.entityId);

    expect(actorManager.hasLivingActors(0)).toBe(true);
});

test('Player count remains unchanged after an actor is removed', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    expect(actorManager.playerCount).toBe(2);

    dispatchActorDies(ecs, actor0.entityId);

    expect(actorManager.playerCount).toBe(2);
});
