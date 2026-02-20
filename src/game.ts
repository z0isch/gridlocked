import { easyBigrams, easyTrigrams, dictionary } from './words'

export type Card = { ngram: string; faceUp: boolean }

export type CardSlot =
  | { kind: 'ngram'; cardIndex: number; ngramChars: string }
  | { kind: 'wild'; cardIndex: number }

export type GameState = {
  deck: Card[]
  hand: Card[]
  discard: Card[]
  currentWord: string
  cardSlots: CardSlot[]
  score: number
  turnNumber: number
  message: string | null
}

export type Action =
  | { type: 'TYPE_LETTER'; letter: string; slots: CardSlot[] }
  | { type: 'BACKSPACE'; slots: CardSlot[] }
  | { type: 'CLEAR_WORD' }
  | { type: 'SUBMIT_WORD' }
  | { type: 'DISMISS_MESSAGE' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n)
}

function buildStarterDeck(): Card[] {
  const singleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let letters = pickRandom(singleLetters, 5)
  if (letters.includes('Q') && !letters.includes('U')) {
    // Replace a random non-Q letter with U
    const replaceIdx = letters.findIndex(l => l !== 'Q')
    letters = [...letters.slice(0, replaceIdx), 'U', ...letters.slice(replaceIdx + 1)]
  }
  const bigrams = pickRandom([...easyBigrams], 3)
  const trigrams = pickRandom([...easyTrigrams], 2)

  return shuffle([...letters, ...bigrams, ...trigrams].map(ngram => ({ ngram, faceUp: true })))
}

export function createInitialState(): GameState {
  const deck = buildStarterDeck()
  return {
    deck: deck.slice(5),
    hand: deck.slice(0, 5),
    discard: [],
    currentWord: '',
    cardSlots: [],
    score: 0,
    turnNumber: 1,
    message: null,
  }
}

function drawHand(deck: Card[], discard: Card[]): { hand: Card[]; deck: Card[]; discard: Card[] } {
  let d = [...deck]
  let disc = [...discard]
  const hand: Card[] = []

  while (hand.length < 5) {
    if (d.length === 0) {
      if (disc.length === 0) break
      d = shuffle(disc.map(c => ({ ...c, faceUp: true })))
      disc = []
    }
    hand.push({ ...d[0], faceUp: true })
    d = d.slice(1)
  }

  return { hand, deck: d, discard: disc }
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TYPE_LETTER':
      return {
        ...state,
        currentWord: state.currentWord + action.letter,
        cardSlots: action.slots,
        message: null,
      }

    case 'BACKSPACE':
      if (state.currentWord.length === 0) return state
      return {
        ...state,
        currentWord: state.currentWord.slice(0, -1),
        cardSlots: action.slots,
        message: null,
      }

    case 'CLEAR_WORD':
      return { ...state, currentWord: '', cardSlots: [], message: null }

    case 'SUBMIT_WORD': {
      if (state.currentWord.length === 0) return state

      const inDict = dictionary.has(state.currentWord)
      const hasNgram = state.cardSlots.some(s => s.kind === 'ngram')

      if (!inDict) return { ...state, message: 'Not in word list!' }
      if (!hasNgram) return { ...state, message: 'Must use at least one card!' }

      const points = state.currentWord.length
      const usedDiscard = [...state.discard, ...state.hand.map(c => ({ ...c, faceUp: true }))]
      const { hand, deck, discard } = drawHand(state.deck, usedDiscard)

      return {
        ...state,
        deck,
        hand,
        discard,
        currentWord: '',
        cardSlots: [],
        score: state.score + points,
        turnNumber: state.turnNumber + 1,
        message: `+${points}`,
      }
    }

    case 'DISMISS_MESSAGE':
      return { ...state, message: null }

    default:
      return state
  }
}
