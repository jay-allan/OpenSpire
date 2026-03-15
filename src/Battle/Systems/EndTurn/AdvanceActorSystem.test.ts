import type { Battle } from '../../Battle';
import { Actor } from '../../Actor/Actor';
import { ActorManager } from '../../ActorModel';
import { AdvanceActorSystem } from './AdvanceActorSystem';
import { PlayerTurnSwitchSystem } from './PlayerTurnSwitchSystem';
import { ActorTurnFinishedEvent } from '../../Triggers/Events/ActorTurnFinishedEvent';
import { PlayerTurnFinishedEvent } from '../../Triggers/Events/PlayerTurnFinishedEvent';
import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';

class MockActor extends Actor {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async playTurn(_battle: Battle): Promise<void> {}
}

function finishTurn(ecs: ECS, entityId: number): void {
    ecs.eventBus.dispatch<ActorTurnFinishedEvent>(
        ActorTurnFinishedEvent.type,
        { originEntityId: entityId }
    );
}

let ecs: ECS;
let actorManager: ActorManager;

beforeEach(() => {
    ecs = new ECS(new EventBus());
    actorManager = new ActorManager();

    const advance = ecs.createSystem(AdvanceActorSystem);
    advance.setActorManager(actorManager);

    const switchPlayer = ecs.createSystem(PlayerTurnSwitchSystem);
    switchPlayer.setActorManager(actorManager);
});

afterEach(() => {
    ecs.destroy();
});

test('Single actor per player: finishing turn switches to the next player', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    expect(actorManager.currentActor).toBe(actor0);
    expect(actorManager.currentPlayerIndex).toBe(0);

    finishTurn(ecs, actor0.entityId);

    expect(actorManager.currentActor).toBe(actor1);
    expect(actorManager.currentPlayerIndex).toBe(1);
});

test('Multiple actors per player: finishing turn advances to the next actor within the same player', () => {
    const actor0a = new MockActor(0, 0);
    const actor0b = new MockActor(1, 0);
    const actor1 = new MockActor(2, 1);
    actorManager.addActor(0, actor0a);
    actorManager.addActor(0, actor0b);
    actorManager.addActor(1, actor1);

    expect(actorManager.currentActor).toBe(actor0a);
    expect(actorManager.currentPlayerIndex).toBe(0);

    finishTurn(ecs, actor0a.entityId);

    expect(actorManager.currentActor).toBe(actor0b);
    expect(actorManager.currentPlayerIndex).toBe(0);
});

test('Multiple actors per player: after all actors in a group finish, switches to the next player', () => {
    const actor0a = new MockActor(0, 0);
    const actor0b = new MockActor(1, 0);
    const actor1 = new MockActor(2, 1);
    actorManager.addActor(0, actor0a);
    actorManager.addActor(0, actor0b);
    actorManager.addActor(1, actor1);

    finishTurn(ecs, actor0a.entityId);
    finishTurn(ecs, actor0b.entityId);

    expect(actorManager.currentActor).toBe(actor1);
    expect(actorManager.currentPlayerIndex).toBe(1);
});

test('Turn order wraps back to the first player after all players have gone', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    finishTurn(ecs, actor0.entityId);
    finishTurn(ecs, actor1.entityId);

    expect(actorManager.currentActor).toBe(actor0);
    expect(actorManager.currentPlayerIndex).toBe(0);
});

test('PlayerTurnFinishedEvent is dispatched with the finishing player index when all their actors have gone', () => {
    const actor0 = new MockActor(0, 0);
    const actor1 = new MockActor(1, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    let receivedPlayerIndex = -1;
    ecs.eventBus.register(PlayerTurnFinishedEvent.type, (payload) => {
        const event = payload as PlayerTurnFinishedEvent;
        receivedPlayerIndex = event.playerIndex;
    });

    finishTurn(ecs, actor0.entityId);

    expect(receivedPlayerIndex).toBe(0);
});

test('PlayerTurnFinishedEvent is not dispatched when the actor is not the last in their group', () => {
    const actor0a = new MockActor(0, 0);
    const actor0b = new MockActor(1, 0);
    const actor1 = new MockActor(2, 1);
    actorManager.addActor(0, actor0a);
    actorManager.addActor(0, actor0b);
    actorManager.addActor(1, actor1);

    let eventFired = false;
    ecs.eventBus.register(PlayerTurnFinishedEvent.type, () => {
        eventFired = true;
    });

    finishTurn(ecs, actor0a.entityId);

    expect(eventFired).toBe(false);
});

test('PlayerTurnFinishedEvent carries the entity ID of the actor that finished last', () => {
    const actor0 = new MockActor(42, 0);
    const actor1 = new MockActor(99, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1);

    let receivedOriginEntityId = -1;
    ecs.eventBus.register(PlayerTurnFinishedEvent.type, (payload) => {
        const event = payload as PlayerTurnFinishedEvent;
        receivedOriginEntityId = event.originEntityId;
    });

    finishTurn(ecs, actor0.entityId);

    expect(receivedOriginEntityId).toBe(42);
});
