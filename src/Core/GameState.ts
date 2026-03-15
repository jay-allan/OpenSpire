export interface GameState {
    Enter(): void;
    Exit(): void;
    Run(): Promise<void>;
}
