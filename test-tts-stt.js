// Test script to verify TTS/STT functionality
// This should be run in the browser console when the app is loaded

async function testTTSEndpoints() {
  console.log('Testing TTS endpoints...')
  
  try {
    // Test TTS status
    const ttsStatusResponse = await fetch('/api/tts/status')
    const ttsStatus = await ttsStatusResponse.json()
    console.log('TTS Status:', ttsStatus)
    
    // Test TTS synthesis
    const synthesisResponse = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of the text-to-speech service.',
        voice: 'coqui-female-en',
        language: 'en',
        speed: 1.0,
        pitch: 1.0,
        energy: 1.0,
      }),
    })
    const synthesisResult = await synthesisResponse.json()
    console.log('TTS Synthesis Result:', synthesisResult)
    
  } catch (error) {
    console.error('TTS Test Error:', error)
  }
}

async function testSTTEndpoints() {
  console.log('Testing STT endpoints...')
  
  try {
    // Test STT status
    const sttStatusResponse = await fetch('/api/stt/status')
    const sttStatus = await sttStatusResponse.json()
    console.log('STT Status:', sttStatus)
    
    // Test STT transcription from URL
    const transcriptionResponse = await fetch('/api/stt/transcribe-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: 'https://example.com/test-audio.wav',
        language: 'en',
      }),
    })
    const transcriptionResult = await transcriptionResponse.json()
    console.log('STT Transcription Result:', transcriptionResult)
    
  } catch (error) {
    console.error('STT Test Error:', error)
  }
}

async function testVoiceEndpoints() {
  console.log('Testing Voice endpoints...')
  
  try {
    // Test get voices
    const voicesResponse = await fetch('/api/voices')
    const voices = await voicesResponse.json()
    console.log('Voices:', voices)
    
    // Test voice stats
    const statsResponse = await fetch('/api/voices/stats/summary')
    const stats = await statsResponse.json()
    console.log('Voice Stats:', stats)
    
  } catch (error) {
    console.error('Voice Test Error:', error)
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting TTS/STT Service Tests...')
  await testTTSEndpoints()
  await testSTTEndpoints()
  await testVoiceEndpoints()
  console.log('All tests completed!')
}

// Export for use in browser console
window.testTTSService = runAllTests


