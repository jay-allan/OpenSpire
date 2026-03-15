import { GameState } from './GameState';
import { GameStateManager } from './GameStateManager';

class TestGameState implements GameState {
    private _isEnterCalled = false;
    private _isExitCalled = false;
    private _isRunCalled = false;

    public get isEnterCalled(): boolean {
        return this._isEnterCalled;
    }

    public get isExitCalled(): boolean {
        return this._isExitCalled;
    }

    public get isRunCalled(): boolean {
        return this._isRunCalled;
    }

    Enter(): void {
        this._isEnterCalled = true;
    }

    Exit(): void {
        this._isExitCalled = true;
    }

    async Run(): Promise<void> {
        this._isRunCalled = true;
    }
}

class TestGameStateManager extends GameStateManager {
    public get CurrentGameState(): GameState | undefined {
        return this._currentState;
    }
}

const STATE_START: string = 'START';
const STATE_END: string = 'END';

test('Exit for current state is called when switching states', async () => {
    const gs1 = new TestGameState();
    const gs2 = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs1, [STATE_END]);
    gsm.Add(STATE_END, gs2, []);

    await gsm.Switch(STATE_START);
    expect(gs1.isExitCalled).toBe(false);
    await gsm.Switch(STATE_END);
    expect(gs1.isExitCalled).toBe(true);
});

test('Enter for next state is called when switching states', async () => {
    const gs1 = new TestGameState();
    const gs2 = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs1, [STATE_END]);
    gsm.Add(STATE_END, gs2, []);

    await gsm.Switch(STATE_START);
    expect(gs2.isEnterCalled).toBe(false);
    await gsm.Switch(STATE_END);
    expect(gs2.isEnterCalled).toBe(true);
});

test('Run for switched state is called', async () => {
    const gs1 = new TestGameState();
    const gs2 = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs1, [STATE_END]);
    gsm.Add(STATE_END, gs2, []);

    expect(gs1.isRunCalled).toBe(false);
    await gsm.Switch(STATE_START);
    expect(gs1.isRunCalled).toBe(true);
});

test('Next state is set correctly after switching states', async () => {
    const gs1 = new TestGameState();
    const gs2 = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs1, [STATE_END]);
    gsm.Add(STATE_END, gs2, []);

    await gsm.Switch(STATE_START);
    expect(gsm.CurrentGameState).toBe(gs1);
});

test('Switching to undefined state is not possible', async () => {
    const gs = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs, [STATE_END]);

    const success = await gsm.Switch(STATE_END);
    expect(success).toBe(false);
});

test('Switching to unadded state is not possible', async () => {
    const gsm = new TestGameStateManager();

    const success = await gsm.Switch(STATE_START);
    expect(success).toBe(false);
});

test('Switching to unconfigured next state is not possible', async () => {
    const gs1 = new TestGameState();
    const gs2 = new TestGameState();
    const gsm = new TestGameStateManager();

    gsm.Add(STATE_START, gs1, []);
    gsm.Add(STATE_END, gs2, []);

    let result = await gsm.Switch(STATE_START);
    expect(result).toBe(true);
    result = await gsm.Switch(STATE_END);
    expect(result).toBe(false);
});
