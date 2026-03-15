import { GameStateManager } from '../Core/GameStateManager';

import { EndBattlePhase } from './Phase/EndBattlePhase';
import { EndTurnPhase } from './Phase/EndTurnPhase';
import { PlayTurnPhase } from './Phase/PlayTurnPhase';
import { StartBattlePhase } from './Phase/StartBattlePhase';
import { StartTurnPhase } from './Phase/StartTurnPhase';

import { EventBus } from '../Core/EventBus';
import { ECS } from '../Core/ECS/ECS';
import { Entity } from '../Core/ECS/Entity';
import { EnergyComponent } from './Components/Player/EnergyComponent';
import { RefillEnergySystem } from './Systems/StartTurn/RefillEnergySystem';

export class Battle {
    public static readonly PHASE_BATTLE_START: string = 'PHASE_BATTLE_START';
    public static readonly PHASE_TURN_START: string = 'PHASE_TURN_START';
    public static readonly PHASE_TURN_PLAY: string = 'PHASE_TURN_PLAY';
    public static readonly PHASE_TURN_END: string = 'PHASE_TURN_END';
    public static readonly PHASE_BATTLE_END: string = 'PHASE_BATTLE_END';

    protected readonly _stateManager: GameStateManager = new GameStateManager();
    protected readonly _eventBus: EventBus = new EventBus();
    protected readonly _ecs: ECS = new ECS(this._eventBus);
    protected readonly _players: Array<Entity> = new Array<Entity>();

    protected _currentPlayer = 0;

    public constructor() {
        this.initEntityComponentSystem();
        this.initGameStateManager();
    }

    public get currentPlayer(): number {
        return this._currentPlayer;
    }

    public dispatchEvent<T>(event: string, payload?: any) {
        this._eventBus.dispatch<T>(event, payload);
    }

    public switchPhase(phase: string): void {
        this._stateManager.Switch(phase);
    }

    protected initEntityComponentSystem(): void {
        const player = this._ecs.createEntity();
        this._ecs.createComponent<EnergyComponent>(player, EnergyComponent);
        this._currentPlayer = player.id;

        this._players.push(player);

        this._ecs.createSystem(RefillEnergySystem);
    }

    protected initGameStateManager(): void {
        this._stateManager
            .Add(Battle.PHASE_BATTLE_START, new StartBattlePhase(this), [
                Battle.PHASE_TURN_START
            ])
            .Add(Battle.PHASE_TURN_START, new StartTurnPhase(this), [
                Battle.PHASE_TURN_PLAY
            ])
            .Add(Battle.PHASE_TURN_PLAY, new PlayTurnPhase(this), [
                Battle.PHASE_TURN_END
            ])
            .Add(Battle.PHASE_TURN_END, new EndTurnPhase(this), [
                Battle.PHASE_TURN_START,
                Battle.PHASE_BATTLE_END
            ])
            .Add(Battle.PHASE_BATTLE_END, new EndBattlePhase(this), []);

        this._stateManager.Switch(Battle.PHASE_BATTLE_START);
    }
}
