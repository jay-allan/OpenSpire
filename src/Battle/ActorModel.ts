import { Actor } from './Actor/Actor';

/**
 * ActorManager maintains the ordered list of all Actors in a battle,
 * grouped by player side, and tracks whose turn it currently is.
 *
 * Turn order:
 *   All actors for player 0 → all actors for player 1 → back to player 0 → …
 *
 * Within each player's group, actors take turns in the order they were
 * added. Once every actor in the current group has gone, control passes
 * to the next player's group.
 */
export class ActorManager {
    private _players: Array<Array<Actor>> = [];
    private _currentPlayerIndex = 0;
    private _currentActorIndex = 0;

    /**
     * Registers an actor under the given player index. Player slots are
     * created on demand as actors are added.
     *
     * @param playerIndex Index of the player side (0 = human, 1 = computer, …)
     * @param actor       The actor to register
     */
    public addActor(playerIndex: number, actor: Actor): void {
        while (this._players.length <= playerIndex) {
            this._players.push([]);
        }
        this._players[playerIndex].push(actor);
    }

    /**
     * The actor whose turn it currently is.
     */
    public get currentActor(): Actor {
        return this._players[this._currentPlayerIndex][this._currentActorIndex];
    }

    /**
     * The player index of the side currently taking their turn.
     */
    public get currentPlayerIndex(): number {
        return this._currentPlayerIndex;
    }

    public set currentPlayerIndex(value: number) {
        this._currentPlayerIndex = value;
    }

    /**
     * The index of the actor within the current player's group whose turn it
     * currently is.
     */
    public get currentActorIndex(): number {
        return this._currentActorIndex;
    }

    public set currentActorIndex(value: number) {
        this._currentActorIndex = value;
    }

    /**
     * Returns all actors that belong to player sides other than the current
     * one. These are the valid targets for the active actor.
     */
    public getOpponents(): Array<Actor> {
        const result: Array<Actor> = [];
        for (let i = 0; i < this._players.length; i++) {
            if (i !== this._currentPlayerIndex) {
                result.push(...this._players[i]);
            }
        }
        return result;
    }

    /**
     * Returns all actors belonging to the given player index.
     *
     * @param playerIndex The player side to query
     */
    public getActorsForPlayer(playerIndex: number): Array<Actor> {
        if (playerIndex >= this._players.length) {
            return [];
        }
        return [...this._players[playerIndex]];
    }

    /**
     * The number of player sides registered in this manager.
     */
    public get playerCount(): number {
        return this._players.length;
    }

    /**
     * Returns true if the given player side still has at least one actor.
     *
     * @param playerIndex The player side to query
     */
    public hasLivingActors(playerIndex: number): boolean {
        return (
            playerIndex < this._players.length &&
            this._players[playerIndex].length > 0
        );
    }

    /**
     * Removes the actor with the given entity ID from the manager.
     * Adjusts the current actor index so that turn order remains consistent.
     *
     * @param entityId The entity ID of the actor to remove
     */
    public removeActor(entityId: number): void {
        for (let p = 0; p < this._players.length; p++) {
            const idx = this._players[p].findIndex(
                (a) => a.entityId === entityId
            );
            if (idx === -1) continue;

            this._players[p].splice(idx, 1);

            if (
                p === this._currentPlayerIndex &&
                idx < this._currentActorIndex
            ) {
                this._currentActorIndex--;
            }
            break;
        }
    }
}
