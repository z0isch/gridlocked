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
  return (
    <div className="max-w-[600px] mx-auto p-8 text-center font-mono">
      <h1 className="mb-6">Softback</h1>
    </div>
  )
}

export default App
