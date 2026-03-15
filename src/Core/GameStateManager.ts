import { GameState } from './GameState';
import { Logger } from './Logger';

type GameStateEntry = {
    state: GameState;
    nextStateNames: Array<string>;
};

export class GameStateManager {
    protected _currentState: GameState | undefined;
    protected _currentStateName: string;
    protected _gameStates: Map<string, GameStateEntry>;

    public constructor() {
        this._gameStates = new Map<string, GameStateEntry>();
        this._currentStateName = '';
    }

    public Add(
        stateName: string,
        state: GameState,
        nextStateNames: Array<string>
    ): GameStateManager {
        this._gameStates.set(stateName, { state, nextStateNames });
        return this;
    }

    public async Switch(newStateName: string): Promise<boolean> {
        if (!this._gameStates.has(newStateName)) {
            Logger.info('Game state %s is unknown', newStateName);
            return false;
        }

        const newStateEntry: GameStateEntry =
            this._gameStates.get(newStateName)!;
        if (this._currentState == undefined) {
            await this.SetState(newStateName, newStateEntry.state);
            return true;
        }

        const currentStateEntry: GameStateEntry = this._gameStates.get(
            this._currentStateName
        )!;
        if (currentStateEntry.nextStateNames.includes(newStateName)) {
            await this.SetState(newStateName, newStateEntry.state);
            return true;
        }

        return false;
    }

    public async Run(): Promise<void> {
        await this._currentState?.Run();
    }

    private async SetState(
        newStateName: string,
        newState: GameState
    ): Promise<void> {
        if (this._currentState != undefined) {
            this._currentState.Exit();
        }

        newState.Enter();
        this._currentState = newState;
        this._currentStateName = newStateName;

        await newState.Run();
    }
}
