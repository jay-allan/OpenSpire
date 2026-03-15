import { GameStateManager } from '../Core/GameStateManager';

import { EndBattlePhase } from './Phase/EndBattlePhase';
import { EndTurnPhase } from './Phase/EndTurnPhase';
import { PlayTurnPhase } from './Phase/PlayTurnPhase';
import { StartBattlePhase } from './Phase/StartBattlePhase';
import { StartTurnPhase } from './Phase/StartTurnPhase';

import { EventBus } from '../Core/EventBus';
import { ECS } from '../Core/ECS/ECS';
import { EnergyComponent } from './Components/Player/EnergyComponent';
import { HealthComponent } from './Components/Actor/HealthComponent';
import { RefillEnergySystem } from './Systems/StartTurn/RefillEnergySystem';
import { DamageActorSystem } from './Systems/PlayTurn/DamageActorSystem';
import { ReduceEnergySystem } from './Systems/PlayTurn/ReduceEnergySystem';
import { CheckRemainingEnergySystem } from './Systems/PlayTurn/CheckRemainingEnergySystem';
import { RemoveDeadActorSystem } from './Systems/EndTurn/RemoveDeadActorSystem';
import { CheckBattleEndSystem } from './Systems/EndTurn/CheckBattleEndSystem';
import { AdvanceActorSystem } from './Systems/EndTurn/AdvanceActorSystem';
import { PlayerTurnSwitchSystem } from './Systems/EndTurn/PlayerTurnSwitchSystem';
import { ActorManager } from './ActorModel';
import { HumanActor } from './Actor/HumanActor';
import { BattleDisplay } from './Display/BattleDisplay';
import { BattleEndDisplay } from './Display/BattleEndDisplay';
import { ComputerActor } from './Actor/ComputerActor';

export class Battle {
    public static readonly PHASE_BATTLE_START: string = 'PHASE_BATTLE_START';
    public static readonly PHASE_TURN_START: string = 'PHASE_TURN_START';
    public static readonly PHASE_TURN_PLAY: string = 'PHASE_TURN_PLAY';
    public static readonly PHASE_TURN_END: string = 'PHASE_TURN_END';
    public static readonly PHASE_BATTLE_END: string = 'PHASE_BATTLE_END';

    protected readonly _stateManager: GameStateManager = new GameStateManager();
    protected readonly _eventBus: EventBus = new EventBus();
    protected readonly _ecs: ECS = new ECS(this._eventBus);
    protected readonly _actorManager: ActorManager = new ActorManager();

    public constructor() {
        this.initEntityComponentSystem();
        new BattleEndDisplay(0, this._eventBus);
        this.initGameStateManager();
    }

    public get ecs(): ECS {
        return this._ecs;
    }

    public get actorManager(): ActorManager {
        return this._actorManager;
    }

    /**
     * Returns true when at least one player side has no remaining actors.
     * Computed directly from ActorManager state — no separate flag needed.
     */
    public get isBattleOver(): boolean {
        for (let i = 0; i < this._actorManager.playerCount; i++) {
            if (!this._actorManager.hasLivingActors(i)) return true;
        }
        return false;
    }

    public dispatchEvent<T>(event: string, payload?: any) {
        this._eventBus.dispatch<T>(event, payload);
    }

    public async switchPhase(phase: string): Promise<void> {
        await this._stateManager.Switch(phase);
    }

    public async start(): Promise<void> {
        await this._stateManager.Switch(Battle.PHASE_BATTLE_START);
    }

    protected initEntityComponentSystem(): void {
        this.createSystems();
        this.createPlayer(0);
        this.createEnemy(1);
    }

    protected createSystems(): void {
        this._ecs.createSystem(RefillEnergySystem);
        this._ecs.createSystem(DamageActorSystem);
        this._ecs.createSystem(ReduceEnergySystem);
        this._ecs.createSystem(CheckRemainingEnergySystem);

        const removeDeadActor = this._ecs.createSystem(RemoveDeadActorSystem);
        removeDeadActor.setActorManager(this._actorManager);

        const checkBattleEnd = this._ecs.createSystem(CheckBattleEndSystem);
        checkBattleEnd.setActorManager(this._actorManager);

        const advanceActor = this._ecs.createSystem(AdvanceActorSystem);
        advanceActor.setActorManager(this._actorManager);

        const playerTurnSwitch = this._ecs.createSystem(PlayerTurnSwitchSystem);
        playerTurnSwitch.setActorManager(this._actorManager);
    }

    protected createPlayer(playerIndex: number): void {
        const player = this._ecs.createEntity();
        const playerHealth = this._ecs.createComponent<HealthComponent>(
            player,
            HealthComponent
        );
        if (playerHealth) {
            playerHealth.health = 50;
            playerHealth.maxHealth = 50;
        }
        const playerEnergy = this._ecs.createComponent<EnergyComponent>(
            player,
            EnergyComponent
        );
        if (playerEnergy) {
            playerEnergy.energy = 3;
            playerEnergy.maxEnergy = 3;
        }
        this._actorManager.addActor(
            playerIndex,
            new HumanActor(player.id, playerIndex)
        );
        new BattleDisplay(
            player.id,
            playerIndex,
            this._actorManager,
            this._ecs,
            this._eventBus
        );
    }

    protected createEnemy(enemyIndex: number): void {
        const enemy = this._ecs.createEntity();
        const enemyHealth = this._ecs.createComponent<HealthComponent>(
            enemy,
            HealthComponent
        );
        if (enemyHealth) {
            enemyHealth.health = 30;
            enemyHealth.maxHealth = 30;
        }
        this._actorManager.addActor(
            enemyIndex,
            new ComputerActor(enemy.id, enemyIndex)
        );
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
                Battle.PHASE_TURN_END,
                Battle.PHASE_BATTLE_END
            ])
            .Add(Battle.PHASE_TURN_END, new EndTurnPhase(this), [
                Battle.PHASE_TURN_START,
                Battle.PHASE_BATTLE_END
            ])
            .Add(Battle.PHASE_BATTLE_END, new EndBattlePhase(), []);
    }
}
