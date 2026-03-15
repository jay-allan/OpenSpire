import inquirer from 'inquirer';
import type { Battle } from '../Battle';
import { Logger } from '../../Core/Logger';
import { EnergyComponent } from '../Components/Player/EnergyComponent';
import { DamageActorAction } from '../Triggers/Actions/DamageActorAction';
import { ActorTurnFinishedEvent } from '../Triggers/Events/ActorTurnFinishedEvent';
import { TurnActionTakenEvent } from '../Triggers/Events/TurnActionTakenEvent';
import { Actor } from './Actor';

const ATTACK_DAMAGE = 6;

/**
 * A HumanActor presents an interactive Inquirer menu each turn, letting the
 * player choose their action via the keyboard.
 */
export class HumanActor extends Actor {
    public async playTurn(battle: Battle): Promise<void> {
        const energy = battle.ecs.getEntityComponent<EnergyComponent>(
            this.entityId,
            EnergyComponent
        );

        if (!energy) {
            Logger.warn(
                `HumanActor ${this.entityId} has no EnergyComponent — ending turn immediately.`
            );
            battle.dispatchEvent<ActorTurnFinishedEvent>(
                ActorTurnFinishedEvent.type,
                { originEntityId: this.entityId }
            );
            return;
        }

        Logger.info(
            `HumanActor ${this.entityId} (player ${this.playerIndex}) starting turn with ${energy.energy}/${energy.maxEnergy} energy.`
        );

        while (energy.energy > 0 && !battle.isBattleOver) {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Choose your action:',
                    choices: [
                        {
                            name: `Attack  (${ATTACK_DAMAGE} damage)`,
                            value: 'attack'
                        },
                        { name: 'End Turn', value: 'endTurn' }
                    ]
                }
            ]);

            if (action === 'attack') {
                const opponents = battle.actorManager.getOpponents();
                if (opponents.length > 0) {
                    const target = opponents[0];
                    Logger.info(
                        `HumanActor ${this.entityId} attacks entity ${target.entityId} for ${ATTACK_DAMAGE} damage.`
                    );
                    battle.dispatchEvent<DamageActorAction>(
                        DamageActorAction.type,
                        {
                            originEntityId: this.entityId,
                            targetEntityId: target.entityId,
                            damage: ATTACK_DAMAGE
                        }
                    );
                    if (!battle.isBattleOver) {
                        battle.dispatchEvent<TurnActionTakenEvent>(
                            TurnActionTakenEvent.type,
                            { originEntityId: this.entityId }
                        );
                        // ReduceEnergySystem decremented energy.energy; if now 0,
                        // CheckRemainingEnergySystem dispatched ActorTurnFinishedEvent.
                    } else {
                        Logger.info(
                            `HumanActor ${this.entityId} ended the battle with their attack — skipping energy reduction.`
                        );
                    }
                } else {
                    Logger.warn(
                        `HumanActor ${this.entityId} chose to attack but has no opponents.`
                    );
                }
            } else {
                Logger.info(
                    `HumanActor ${this.entityId} chose to end their turn early.`
                );
                battle.dispatchEvent<ActorTurnFinishedEvent>(
                    ActorTurnFinishedEvent.type,
                    { originEntityId: this.entityId }
                );
                break;
            }
        }
    }
}
