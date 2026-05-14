// lib/ranking/borda.ts
export function bordaScore(ranks: number[]): number {
  return ranks.reduce((acc, r) => (r >= 1 && r <= 10 ? acc + (11 - r) : acc), 0);
}
