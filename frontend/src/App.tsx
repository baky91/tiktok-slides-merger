import { SettingsProvider } from './contexts/SettingsProvider'
import { SlidesMergerPage } from './pages/SlidesMergerPage'

function App() {
  return (
    <SettingsProvider>
      <SlidesMergerPage />
    </SettingsProvider>
  )
}

export default App
