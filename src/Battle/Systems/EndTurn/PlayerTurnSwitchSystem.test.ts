import type { Battle } from '../../Battle';
import { Actor } from '../../Actor/Actor';
import { ActorManager } from '../../ActorModel';
import { PlayerTurnSwitchSystem } from './PlayerTurnSwitchSystem';
import { PlayerTurnFinishedEvent } from '../../Triggers/Events/PlayerTurnFinishedEvent';
import { ECS } from '../../../Core/ECS/ECS';
import { EventBus } from '../../../Core/EventBus';
import { Logger } from '../../../Core/Logger';

class MockActor extends Actor {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async playTurn(_battle: Battle): Promise<void> {}
}

function dispatchPlayerTurnFinished(
    ecs: ECS,
    originEntityId: number,
    playerIndex: number
): void {
    ecs.eventBus.dispatch<PlayerTurnFinishedEvent>(
        PlayerTurnFinishedEvent.type,
        { originEntityId, playerIndex }
    );
}

let ecs: ECS;
let actorManager: ActorManager;

beforeEach(() => {
    ecs = new ECS(new EventBus());
    actorManager = new ActorManager();
    const system = ecs.createSystem(PlayerTurnSwitchSystem);
    system.setActorManager(actorManager);
});

afterEach(() => {
    ecs.destroy();
    jest.restoreAllMocks();
});

test('Switches to the next player when PlayerTurnFinishedEvent is received', () => {
    actorManager.addActor(0, new MockActor(0, 0));
    actorManager.addActor(1, new MockActor(1, 1));

    expect(actorManager.currentPlayerIndex).toBe(0);

    dispatchPlayerTurnFinished(ecs, 0, 0);

    expect(actorManager.currentPlayerIndex).toBe(1);
});

test('Sets the current actor to the first actor of the new player', () => {
    const actor0 = new MockActor(0, 0);
    const actor1a = new MockActor(1, 1);
    const actor1b = new MockActor(2, 1);
    actorManager.addActor(0, actor0);
    actorManager.addActor(1, actor1a);
    actorManager.addActor(1, actor1b);

    dispatchPlayerTurnFinished(ecs, 0, 0);

    expect(actorManager.currentActor).toBe(actor1a);
});

test('Logs when a PlayerTurnFinishedEvent is received', () => {
    const logSpy = jest.spyOn(Logger, 'info');

    actorManager.addActor(0, new MockActor(0, 0));
    actorManager.addActor(1, new MockActor(1, 1));

    dispatchPlayerTurnFinished(ecs, 0, 0);

    expect(logSpy).toHaveBeenCalled();
});

test('Log message contains the index of the player whose turn ended', () => {
    const logSpy = jest.spyOn(Logger, 'info');

    actorManager.addActor(0, new MockActor(0, 0));
    actorManager.addActor(1, new MockActor(1, 1));

    dispatchPlayerTurnFinished(ecs, 0, 0);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Player 0'));
});

test('Log message contains the index of the player whose turn is beginning', () => {
    const logSpy = jest.spyOn(Logger, 'info');

    actorManager.addActor(0, new MockActor(0, 0));
    actorManager.addActor(1, new MockActor(1, 1));

    dispatchPlayerTurnFinished(ecs, 0, 0);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Player 1'));
});
