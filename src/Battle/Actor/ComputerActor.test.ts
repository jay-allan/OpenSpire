import { EventBus } from '../../Core/EventBus';
import { Actor } from './Actor';
import { ComputerActor } from './ComputerActor';
import { ActorTurnFinishedEvent } from '../Triggers/Events/ActorTurnFinishedEvent';

function makeBattle(eventBus: EventBus, opponents: Actor[] = []) {
    return {
        actorManager: { getOpponents: () => opponents },
        dispatchEvent: <T>(event: string, payload?: T) =>
            eventBus.dispatch<T>(event, payload)
    };
}

let eventBus: EventBus;

beforeEach(() => {
    eventBus = new EventBus();
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

test('ActorTurnFinishedEvent is dispatched when there are no opponents', async () => {
    const actor = new ComputerActor(1, 1);
    let eventDispatched = false;
    eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventDispatched = true;
    });

    await actor.playTurn(makeBattle(eventBus) as any);

    expect(eventDispatched).toBe(true);
});

test('ActorTurnFinishedEvent is dispatched when opponents are present', async () => {
    const actor = new ComputerActor(1, 1);
    const opponent = new ComputerActor(0, 0);
    let eventDispatched = false;
    eventBus.register(ActorTurnFinishedEvent.type, () => {
        eventDispatched = true;
    });

    await actor.playTurn(makeBattle(eventBus, [opponent]) as any);

    expect(eventDispatched).toBe(true);
});

test('ActorTurnFinishedEvent carries the actor entity ID as originEntityId', async () => {
    const ENTITY_ID = 42;
    const actor = new ComputerActor(ENTITY_ID, 1);
    let receivedOriginId = -1;
    eventBus.register(ActorTurnFinishedEvent.type, (payload) => {
        const event = payload as ActorTurnFinishedEvent;
        receivedOriginId = event.originEntityId;
    });

    await actor.playTurn(makeBattle(eventBus) as any);

    expect(receivedOriginId).toBe(ENTITY_ID);
});
