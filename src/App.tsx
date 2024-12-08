import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WalletConnect from './components/WalletConnect'
import SendTransaction from './components/SendTransaction'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header>
        <h1>Bitcoin Wallet with Unisat</h1>
      </header>
      
      <main>
        <WalletConnect />
        <SendTransaction />
      </main>

      <footer>
        <p>Make sure you have the Unisat wallet extension installed</p>
      </footer>
    </div>
  )
}

export default App
