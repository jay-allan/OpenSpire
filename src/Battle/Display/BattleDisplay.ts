import { ECS } from '../../Core/ECS/ECS';
import { EventBus } from '../../Core/EventBus';
import { ActorManager } from '../ActorModel';
import { HealthComponent } from '../Components/Actor/HealthComponent';
import { EnergyComponent } from '../Components/Player/EnergyComponent';
import { ActorDamagedEvent } from '../Triggers/Events/ActorDamagedEvent';
import { TurnStartedTrigger } from '../Triggers/Phases/TurnStartedTrigger';

/**
 * Subscribes to game events and renders the battle status to the console.
 * Depends on the game model — the game model has no knowledge of this class.
 */
export class BattleDisplay {
    private readonly _playerEntityId: number;
    private readonly _playerIndex: number;
    private readonly _actorManager: ActorManager;
    private readonly _ecs: ECS;

    public constructor(
        playerEntityId: number,
        playerIndex: number,
        actorManager: ActorManager,
        ecs: ECS,
        eventBus: EventBus
    ) {
        this._playerEntityId = playerEntityId;
        this._playerIndex = playerIndex;
        this._actorManager = actorManager;
        this._ecs = ecs;

        eventBus.register(
            TurnStartedTrigger.type,
            this.onTurnStarted.bind(this)
        );
        eventBus.register(
            ActorDamagedEvent.type,
            this.onActorDamaged.bind(this)
        );
    }

    private onTurnStarted(payload?: unknown): void {
        const event = payload as TurnStartedTrigger;
        if (event.originEntityId === this._playerEntityId) {
            this.printStatus();
        } else {
            console.log('\n[ Enemy\'s Turn ]');
        }
    }

    private onActorDamaged(payload?: unknown): void {
        const event = payload as ActorDamagedEvent;
        if (event.targetEntityId === this._playerEntityId) {
            this.printStatus();
        }
    }

    private printStatus(): void {
        let opponentEntityId: number | undefined;
        for (let i = 0; i < this._actorManager.playerCount; i++) {
            if (i !== this._playerIndex) {
                const actors = this._actorManager.getActorsForPlayer(i);
                if (actors.length > 0) {
                    opponentEntityId = actors[0].entityId;
                }
                break;
            }
        }

        const enemyHealth =
            opponentEntityId !== undefined
                ? this._ecs.getEntityComponent<HealthComponent>(
                      opponentEntityId,
                      HealthComponent
                  )
                : undefined;

        const playerHealth = this._ecs.getEntityComponent<HealthComponent>(
            this._playerEntityId,
            HealthComponent
        );
        const playerEnergy = this._ecs.getEntityComponent<EnergyComponent>(
            this._playerEntityId,
            EnergyComponent
        );

        console.log('\n----------------------------------------');
        console.log(
            `  Enemy   HP: ${enemyHealth?.health ?? 0}/${
                enemyHealth?.maxHealth ?? 0
            }`
        );
        console.log(
            `  Player  HP: ${playerHealth?.health ?? 0}/${
                playerHealth?.maxHealth ?? 0
            }  |  Energy: ${playerEnergy?.energy ?? 0}/${
                playerEnergy?.maxEnergy ?? 0
            }`
        );
        console.log('----------------------------------------');
    }
}
