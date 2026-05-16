export type EloPlayer = {
  elo: number;
  score: 0 | 0.5 | 1;
};

export function expectedScore(playerRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

export function calculateElo(player: EloPlayer, opponentRating: number, kFactor = 32) {
  const expected = expectedScore(player.elo, opponentRating);
  return Math.round(player.elo + kFactor * (player.score - expected));
}

export function calculateMatchElo(hareElo: number, houndsElo: number, winner: "hare" | "hounds" | null) {
  const hareScore = winner === "hare" ? 1 : winner === "hounds" ? 0 : 0.5;
  const houndsScore = winner === "hounds" ? 1 : winner === "hare" ? 0 : 0.5;

  return {
    hare: calculateElo({ elo: hareElo, score: hareScore as 0 | 0.5 | 1 }, houndsElo),
    hounds: calculateElo({ elo: houndsElo, score: houndsScore as 0 | 0.5 | 1 }, hareElo)
  };
}
