import type { Card, CardSlot } from './game'

/**
 * Backtracking assignment that maximises ngram-card usage.
 *
 * At each position in `word`, every unused face-up card is tried both as an
 * ngram match (when it fits) and as a one-letter wild. The assignment that
 * covers the whole word using the most ngram cards wins.
 *
 * Returns an array parallel to `word` (one CardSlot per character), or null
 * if the word cannot be covered (ran out of cards).
 */
export function assignCards(hand: Card[], word: string): CardSlot[] | null {
  if (word.length === 0) return []

  let bestSlots: CardSlot[] | null = null
  let bestNgramCount = -1

  function backtrack(
    i: number,
    used: Set<number>,
    slots: CardSlot[],
    ngramCount: number
  ): void {
    if (i >= word.length) {
      if (ngramCount > bestNgramCount) {
        bestNgramCount = ngramCount
        bestSlots = [...slots]
      }
      return
    }

    for (let ci = 0; ci < hand.length; ci++) {
      if (used.has(ci) || !hand[ci].faceUp) continue
      const { ngram } = hand[ci]

      // Option A: use as ngram match (only when the card fits here)
      if (word.startsWith(ngram, i)) {
        used.add(ci)
        for (let j = 0; j < ngram.length; j++)
          slots.push({ kind: 'ngram', cardIndex: ci, ngramChars: ngram })
        backtrack(i + ngram.length, used, slots, ngramCount + ngram.length)
        for (let j = 0; j < ngram.length; j++) slots.pop()
        used.delete(ci)
      }

      // Option B: use as one-letter wild
      used.add(ci)
      slots.push({ kind: 'wild', cardIndex: ci })
      backtrack(i + 1, used, slots, ngramCount)
      slots.pop()
      used.delete(ci)
    }
  }

  backtrack(0, new Set<number>(), [], 0)
  return bestSlots
}
