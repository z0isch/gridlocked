import { useReducer, useEffect, useCallback, useRef } from 'react'
import { gameReducer, createInitialState } from './game'
import type { GameState } from './game'
import { assignCards } from './matching'

const typeSounds = [1, 2, 3, 4].map(n => {
  const audio = new Audio(`${import.meta.env.BASE_URL}sounds/typewriter${n}.ogg`)
  audio.preload = 'auto'
  return audio
})

const bellSound = new Audio(`${import.meta.env.BASE_URL}sounds/bell.ogg`)
bellSound.preload = 'auto'

const thunkSound = new Audio(`${import.meta.env.BASE_URL}sounds/thunk.ogg`)
thunkSound.preload = 'auto'

function playTypeSound() {
  const sound = typeSounds[Math.floor(Math.random() * typeSounds.length)]
  sound.currentTime = 0
  sound.play()
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)

  // Keep a stable ref to current state so the keyboard handler never goes stale.
  const stateRef = useRef<GameState>(state)
  useEffect(() => { stateRef.current = state })

  const handleKey = useCallback((e: KeyboardEvent) => {
    const { currentWord, hand } = stateRef.current
    const key = e.key.toUpperCase()

    if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      const newWord = currentWord + key
      const slots = assignCards(hand, newWord)
      if (slots !== null) {
        playTypeSound()
        dispatch({ type: 'TYPE_LETTER', letter: key, slots })
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      if (currentWord.length === 0) return
      const newWord = currentWord.slice(0, -1)
      const slots = newWord.length > 0 ? (assignCards(hand, newWord) ?? []) : []
      playTypeSound()
      dispatch({ type: 'BACKSPACE', slots })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      dispatch({ type: 'SUBMIT_WORD' })
    } else if (e.key === 'Escape') {
      e.preventDefault()
      dispatch({ type: 'CLEAR_WORD' })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Play sounds and auto-dismiss messages.
  useEffect(() => {
    if (state.message === null) return
    if (state.message.startsWith('+')) {
      bellSound.currentTime = 0
      bellSound.play()
    } else {
      thunkSound.currentTime = 0
      thunkSound.play()
    }
    const timer = setTimeout(() => dispatch({ type: 'DISMISS_MESSAGE' }), 1500)
    return () => clearTimeout(timer)
  }, [state.message])

  // Derive active card sets from current slots.
  const usedAsNgram = new Set(
    state.cardSlots.filter(s => s.kind === 'ngram').map(s => s.cardIndex),
  )
  const usedAsWild = new Set(
    state.cardSlots.filter(s => s.kind === 'wild').map(s => s.cardIndex),
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-mono select-none p-12">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="text-zinc-500 text-xl tracking-widest">
          TURN {state.turnNumber} &nbsp;·&nbsp; SCORE {state.score}
        </div>
      </div>

      {/* Hand */}
      <div className="flex gap-3 mb-20">
        {state.hand.map((card, ci) => {
          const isNgram = usedAsNgram.has(ci)
          const isWild = usedAsWild.has(ci)
          const cardClass = [
            'flex items-center justify-center rounded border-2 font-bold transition-colors',
            'min-w-[88px] h-24 px-4 text-5xl',
            isNgram
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
              : isWild
                ? 'bg-amber-950 border-amber-600 text-amber-400 opacity-60'
                : 'bg-zinc-800 border-zinc-600 text-zinc-200',
          ].join(' ')

          return (
            <div key={ci} className={cardClass}>
              {card.ngram}
            </div>
          )
        })}

        {/* Empty placeholder slots when hand is smaller than 5 */}
        {Array.from({ length: Math.max(0, 5 - state.hand.length) }, (_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center rounded border-2 border-dashed border-zinc-800 min-w-[88px] h-24 px-4"
          />
        ))}
      </div>

      {/* Word display */}
      <div className="h-32 flex items-center gap-px mb-8 min-w-[560px] justify-center">
        {state.currentWord.length === 0 ? (
          <span className="text-zinc-700 text-2xl tracking-[0.4em]">TYPE A WORD</span>
        ) : (
          state.currentWord.split('').map((letter, li) => {
            const slot = state.cardSlots[li]
            const color =
              slot?.kind === 'ngram'
                ? 'text-emerald-300'
                : slot?.kind === 'wild'
                  ? 'text-amber-400'
                  : 'text-zinc-200'
            return (
              <span key={li} className={`text-7xl font-bold tracking-tight ${color}`}>
                {letter}
              </span>
            )
          })
        )}
      </div>

      {/* Message / feedback */}
      <div className="h-9 flex items-center">
        {state.message && (
          <span
            className={`text-base font-bold tracking-widest ${
              state.message.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {state.message}
          </span>
        )}
      </div>


      {/* Deck counters */}
      <div className="mt-4 text-zinc-700 text-xl tracking-widest">
        DECK&nbsp;{state.deck.length}&nbsp;·&nbsp;DISCARD&nbsp;{state.discard.length}
      </div>
    </div>
  )
}

export default App
