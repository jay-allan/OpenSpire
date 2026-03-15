import type { Battle } from '../Battle';
import { Logger } from '../../Core/Logger';
import { DamageActorAction } from '../Triggers/Actions/DamageActorAction';
import { ActorTurnFinishedEvent } from '../Triggers/Events/ActorTurnFinishedEvent';
import { Actor } from './Actor';

const ATTACK_DAMAGE = 4;

/**
 * A ComputerActor automatically takes its turn by attacking the first
 * available opponent. Used for enemy entities.
 */
export class ComputerActor extends Actor {
    public async playTurn(battle: Battle): Promise<void> {
        Logger.info(
            `ComputerActor ${this.entityId} (player ${this.playerIndex}) is taking their turn.`
        );

        const opponents = battle.actorManager.getOpponents();
        if (opponents.length > 0) {
            const target = opponents[0];
            Logger.info(
                `ComputerActor ${this.entityId} attacks entity ${target.entityId} for ${ATTACK_DAMAGE} damage.`
            );
            console.log(`\nEnemy attacks for ${ATTACK_DAMAGE} damage!`);
            battle.dispatchEvent<DamageActorAction>(DamageActorAction.type, {
                originEntityId: this.entityId,
                targetEntityId: target.entityId,
                damage: ATTACK_DAMAGE
            });
        } else {
            Logger.warn(
                `ComputerActor ${this.entityId} has no opponents to attack — skipping attack.`
            );
        }

        battle.dispatchEvent<ActorTurnFinishedEvent>(
            ActorTurnFinishedEvent.type,
            { originEntityId: this.entityId }
        );
    }
}
