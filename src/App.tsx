import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { ChatServicePage } from './pages/ChatServicePage'
import { ImageServicePage } from './pages/ImageServicePage'
import { TTSServicePage } from './pages/TTSServicePage'
import { ApiGatewayPage } from './pages/ApiGatewayPage'
import { OllamaServicePage } from './pages/OllamaServicePage'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/service/api-gateway" element={<ApiGatewayPage />} />
          <Route path="/service/chat-service" element={<ChatServicePage />} />
          <Route path="/service/image-service" element={<ImageServicePage />} />
          <Route path="/service/tts-stt-service" element={<TTSServicePage />} />
          <Route path="/service/ollama-service" element={<OllamaServicePage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
