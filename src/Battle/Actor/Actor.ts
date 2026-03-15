import type { Battle } from '../Battle';

/**
 * An Actor is any entity in a battle that can take turns — whether controlled
 * by a human player or a computer. Each Actor belongs to exactly one player
 * side (identified by playerIndex) and wraps a single ECS entity.
 */
export abstract class Actor {
    /**
     * The ECS entity ID of this actor.
     */
    public readonly entityId: number;

    /**
     * The index of the player side this actor belongs to.
     * Actors sharing the same playerIndex all take their turns before
     * control passes to the next player.
     */
    public readonly playerIndex: number;

    public constructor(entityId: number, playerIndex: number) {
        this.entityId = entityId;
        this.playerIndex = playerIndex;
    }

    /**
     * Executes this actor's turn and dispatches an ActorTurnFinishedEvent
     * when done.
     *
     * @param battle The active Battle instance
     */
    public abstract playTurn(battle: Battle): Promise<void>;
}
