# TTS/STT Service Testing Guide

## Overview
This document provides comprehensive testing instructions for the TTS/STT Service integration in the Fullstack Demo dashboard.

## Prerequisites
- Frontend development server running on `http://localhost:5173`
- Browser with developer tools enabled
- MSW (Mock Service Worker) properly configured

## Testing the Dashboard UI

### 1. Access the Dashboard
1. Open your browser and navigate to `http://localhost:5173`
2. You should see the dashboard with the new TTS/STT service cards
3. The TTS service card should be positioned on the left side
4. The STT service card should be positioned on the right side

### 2. Test TTS Service Card
1. **Service Status**: Verify the TTS service shows "online" status with a green badge
2. **Voice Selection**: Check that the voice dropdown contains multiple voice options
3. **Text Input**: Enter some text in the text input field
4. **Voice Parameters**: Adjust the speed, pitch, and energy sliders
5. **Synthesis**: Click the "Synthesize" button and verify:
   - Loading state appears
   - Success toast notification shows
   - Audio URL is generated
   - Play button becomes available

### 3. Test STT Service Card
1. **Service Status**: Verify the STT service shows "online" status with a green badge
2. **Language Selection**: Check that the language dropdown contains multiple options
3. **File Upload**: Test uploading an audio file:
   - Select a valid audio file
   - Verify file information is displayed
   - Click "Transcribe File" button
   - Check for success notification and transcription result
4. **URL Transcription**: Test transcribing from URL:
   - Enter a valid audio URL
   - Click "Transcribe URL" button
   - Verify transcription result appears

## Testing API Endpoints

### Browser Console Testing
1. Open browser developer tools (F12)
2. Navigate to the Console tab
3. Copy and paste the test script from `test-tts-stt.js`
4. Run `testTTSService()` in the console
5. Verify all endpoints return expected responses

### Manual API Testing

#### TTS Endpoints
```javascript
// Test TTS Status
fetch('/api/tts/status')
  .then(response => response.json())
  .then(data => console.log('TTS Status:', data))

// Test TTS Synthesis
fetch('/api/tts/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, this is a test.',
    voice: 'coqui-female-en',
    language: 'en',
    speed: 1.0,
    pitch: 1.0,
    energy: 1.0
  })
})
.then(response => response.json())
.then(data => console.log('Synthesis Result:', data))
```

#### STT Endpoints
```javascript
// Test STT Status
fetch('/api/stt/status')
  .then(response => response.json())
  .then(data => console.log('STT Status:', data))

// Test STT Transcription from URL
fetch('/api/stt/transcribe-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioUrl: 'https://example.com/test-audio.wav',
    language: 'en'
  })
})
.then(response => response.json())
.then(data => console.log('Transcription Result:', data))
```

#### Voice Management Endpoints
```javascript
// Test Get Voices
fetch('/api/voices')
  .then(response => response.json())
  .then(data => console.log('Voices:', data))

// Test Voice Stats
fetch('/api/voices/stats/summary')
  .then(response => response.json())
  .then(data => console.log('Voice Stats:', data))
```

## Expected Results

### TTS Service
- **Status**: Should return `{ status: 'online', voices: [...], languages: [...], supportedFormats: [...], maxTextLength: 5000 }`
- **Synthesis**: Should return `{ audioUrl: '...', metadata: { ... } }`
- **UI**: Should show voice options, parameter controls, and synthesis results

### STT Service
- **Status**: Should return `{ status: 'online', models: [...], supportedLanguages: [...], maxFileSize: 26214400 }`
- **Transcription**: Should return `{ text: '...', language: '...', confidence: ..., segments: [...], metadata: {...} }`
- **UI**: Should show language options, file upload, and transcription results

### Voice Management
- **Voices**: Should return array of voice objects with metadata
- **Stats**: Should return `{ total: 6, byLanguage: {...}, byGender: {...}, byProvider: {...}, premium: 0, default: 2 }`

## Error Testing

### Test Error Scenarios
1. **Empty Text**: Try synthesizing with empty text input
2. **Large File**: Try uploading a file larger than 25MB
3. **Invalid URL**: Try transcribing from an invalid URL
4. **Network Error**: Disable network and test error handling

### Expected Error Responses
- Empty text: Warning toast with "No text provided"
- Large file: Error toast with file size limit message
- Invalid URL: Error toast with transcription failure message
- Network error: Error toast with service unavailable message

## Performance Testing

### Load Testing
1. **Multiple Requests**: Send multiple synthesis requests simultaneously
2. **Large Text**: Test with maximum text length (5000 characters)
3. **Long Audio**: Test with maximum file size (25MB)

### Response Time Expectations
- **TTS Status**: < 100ms
- **STT Status**: < 100ms
- **Voice List**: < 200ms
- **Synthesis**: 500-2000ms (simulated)
- **Transcription**: 1000-3000ms (simulated)

## Integration Testing

### Dashboard Integration
1. **Grid Layout**: Verify TTS/STT cards can be dragged and resized
2. **Responsive Design**: Test on different screen sizes
3. **Theme Support**: Verify cards work in light/dark themes
4. **Error Boundaries**: Test error handling in card components

### Data Flow Testing
1. **State Management**: Verify Zustand store updates correctly
2. **Query Caching**: Check TanStack Query caching behavior
3. **Real-time Updates**: Verify auto-refresh functionality
4. **Persistence**: Test localStorage persistence for grid layout

## Troubleshooting

### Common Issues
1. **MSW Not Working**: Check browser console for MSW initialization errors
2. **CORS Errors**: Verify API client configuration
3. **TypeScript Errors**: Check type definitions in service.types.ts
4. **Component Not Rendering**: Check for missing imports or props

### Debug Steps
1. Check browser console for errors
2. Verify MSW handlers are registered
3. Check network tab for API requests
4. Verify component props and state
5. Check React DevTools for component state

## Success Criteria

### Functional Requirements
- ✅ TTS service card displays and functions correctly
- ✅ STT service card displays and functions correctly
- ✅ All API endpoints return expected responses
- ✅ Error handling works for all scenarios
- ✅ UI components are responsive and accessible

### Performance Requirements
- ✅ API responses are fast (< 3 seconds for synthesis/transcription)
- ✅ UI is responsive and smooth
- ✅ No memory leaks or performance issues
- ✅ Grid layout persists correctly

### Integration Requirements
- ✅ Cards integrate seamlessly with dashboard
- ✅ Theme support works correctly
- ✅ Error boundaries catch and handle errors
- ✅ Real-time updates work as expected

## Next Steps

After successful testing:
1. **Add Advanced Features**: Voice cloning, emotion control, batch processing
2. **Create Python Services**: Implement actual Whisper and Coqui TTS services
3. **Performance Optimization**: Implement caching and optimization strategies
4. **Production Deployment**: Prepare for production environment deployment


