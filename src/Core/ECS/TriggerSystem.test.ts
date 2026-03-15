import { ECS } from './ECS';
import { ENTITY_INVALID } from './ECSConstants';
import { Trigger } from './Trigger';
import { TriggerSystem } from './TriggerSystem';

const TRIGGER_TYPE = 'Test';

class TestTrigger extends Trigger {
    static readonly type: string = TRIGGER_TYPE;

    value: number = 42;
}

class TestTriggerSystem extends TriggerSystem {
    readonly triggerType: string = TRIGGER_TYPE;

    private _isRunCalled: boolean = false;

    public get isRunCalled(): boolean {
        return this._isRunCalled;
    }

    public payload: TestTrigger = new TestTrigger();

    public Run(payload?: any): void {
        this._isRunCalled = true;
        this.payload = payload;
    }
}

let ecs: ECS;

beforeEach(() => {
    ecs = new ECS();
});

afterEach(() => {
    ecs.destroy();
});

test('TriggerSystem registers at EventBus', () => {
    const testTriggerSystem =
        ecs.createSystem<TestTriggerSystem>(TestTriggerSystem);
    expect(testTriggerSystem.isRunCalled).toBe(false);
    ecs.eventBus.dispatch<TestTrigger>(TestTrigger.type);
    expect(testTriggerSystem.isRunCalled).toBe(true);
});

test('TriggerSystem receives payload', () => {
    const PAYLOAD_VALUE: number = 10;
    const testTriggerSystem =
        ecs.createSystem<TestTriggerSystem>(TestTriggerSystem);
    ecs.eventBus.dispatch<TestTrigger>(TestTrigger.type, {
        originEntityId: ENTITY_INVALID,
        value: PAYLOAD_VALUE
    });
    expect(testTriggerSystem.payload).toHaveProperty('originEntityId');
    expect(testTriggerSystem.payload).toHaveProperty('value');
    expect(testTriggerSystem.payload.value).toBe(PAYLOAD_VALUE);
});
