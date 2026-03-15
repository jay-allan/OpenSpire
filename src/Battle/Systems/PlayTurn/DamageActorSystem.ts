import { Entity } from '../../../Core/ECS/Entity';
import { TriggerSystem } from '../../../Core/ECS/TriggerSystem';
import { Logger } from '../../../Core/Logger';
import { BlockComponent } from '../../Components/Actor/BlockComponent';
import { HealthComponent } from '../../Components/Actor/HealthComponent';
import { DamageActorAction } from '../../Triggers/Actions/DamageActorAction';
import { ActorDamagedEvent } from '../../Triggers/Events/ActorDamagedEvent';
import { ActorDiesEvent } from '../../Triggers/Events/ActorDiesEvent';

export type DamageCalculationResult = {
    damageToBlock: number;
    remainingBlock: number;
    damageToHealth: number;
    remainingHealth: number;
};

export class DamageActorSystem extends TriggerSystem {
    readonly triggerType: string = DamageActorAction.type;

    public Run(payload?: any): void {
        Logger.info('DamageActorSystem triggered');

        const data = payload as DamageActorAction;

        const targetEntity: Entity | undefined = this._ecs.getEntity(
            data.targetEntityId
        );
        if (!targetEntity) {
            Logger.error(`Unknown entity ID ${data.targetEntityId}`);
            return;
        }

        const healthComponent: HealthComponent | undefined =
            this._ecs.getEntityComponent<HealthComponent>(
                targetEntity.id,
                HealthComponent
            );
        if (!healthComponent) {
            Logger.error(`Unknown entity ID has no HealthComponent`);
            return;
        }
        const healthAmount = healthComponent.health;

        const blockComponent: BlockComponent | undefined =
            this._ecs.getEntityComponent<BlockComponent>(
                targetEntity.id,
                BlockComponent
            );
        const blockAmount = blockComponent ? blockComponent.block : 0;

        const damageResult: DamageCalculationResult = this.calculateDamage(
            healthAmount,
            blockAmount,
            data.damage
        );
        healthComponent.health = damageResult.remainingHealth;
        if (blockComponent) {
            blockComponent.block = damageResult.remainingBlock;
        }

        this._ecs.eventBus.dispatch<ActorDamagedEvent>(ActorDamagedEvent.type, {
            originEntityId: data.originEntityId,
            targetEntityId: data.targetEntityId,
            damageToBlock: damageResult.damageToBlock,
            damageToHealth: damageResult.damageToHealth
        });
        Logger.info(
            `Damaged entity ${targetEntity.id} (health: ${healthAmount}, block: ${blockAmount}) with ${data.damage} points (new health: ${damageResult.remainingHealth}, new block: ${damageResult.remainingBlock})`
        );

        if (damageResult.remainingHealth <= 0) {
            Logger.info(
                `Dispatching die event for entity ${data.targetEntityId}`
            );

            this._ecs.eventBus.dispatch<ActorDiesEvent>(ActorDiesEvent.type, {
                originEntityId: data.originEntityId,
                targetEntityId: data.targetEntityId
            });
        }
    }

    public calculateDamage(
        health: number,
        block: number,
        damage: number
    ): DamageCalculationResult {
        const remainingDamage = Math.max(0, damage - block);

        return {
            damageToBlock: Math.min(block, damage),
            remainingBlock: Math.max(0, block - damage),
            damageToHealth: Math.min(health, remainingDamage),
            remainingHealth: Math.max(0, health - remainingDamage)
        };
    }
}
