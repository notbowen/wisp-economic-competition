export interface Admin {
    current_round: number;
    player_data: {
        name: string;
        score: number;
    }
}