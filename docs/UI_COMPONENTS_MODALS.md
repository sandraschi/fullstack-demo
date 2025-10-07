# UI Components - Modals & Config Pages

**Version:** 1.0  
**Date:** 2025-10-06  
**Status:** Design Specification

## Overview

Additional UI components needed for fullstack-demo:
1. Beautiful Chakra modals for help and logs
2. Configuration page for LLM provider management
3. Model selection/loading interface

---

## 1. Help Modal Component

### Design
Beautiful, multi-section help modal with:
- Tabs for different help topics
- Search functionality
- Keyboard shortcuts display
- Visual examples/screenshots

### Component Structure

**File:** `src/components/modals/HelpModal.tsx` (< 200 lines)

**Features:**
- Modal overlay (Chakra Modal)
- Tab navigation (Getting Started, Features, Keyboard Shortcuts, About)
- Search input at top
- Scrollable content area
- Close button (X) + ESC key
- Footer with version info

**Content Sections:**

**Tab 1: Getting Started**
- Dashboard overview
- Service cards explanation
- Grid layout controls
- Theme switching

**Tab 2: Features**
- Service monitoring
- Real-time updates
- Chart interactions
- Settings access

**Tab 3: Keyboard Shortcuts**
```
Ctrl+K     - Open command palette
Ctrl+/     - Toggle help modal
Ctrl+,     - Open settings
R          - Refresh all services
T          - Toggle theme
ESC        - Close modals
```

**Tab 4: About**
- Version number
- Tech stack
- GitHub link
- License info

### Chakra Components Used

```typescript
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Code,
  Box,
  Divider,
  Link,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiCommand } from 'react-icons/fi';
```

### Usage Pattern

```typescript
// In TopBar or App.tsx
const { isOpen, onOpen, onClose } = useDisclosure();

// Keyboard shortcut
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      onOpen();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

<HelpModal isOpen={isOpen} onClose={onClose} />
```

---

## 2. Log Viewer Modal Component

### Design
Beautiful log viewer with:
- Real-time log streaming
- Log level filtering
- Search/filter capabilities
- Auto-scroll toggle
- Copy logs button
- Export logs option

### Component Structure

**File:** `src/components/modals/LogViewerModal.tsx` (< 200 lines)

**Features:**
- Large modal (90% viewport width/height)
- Header with service selector
- Filter bar (log level, search term)
- Log display area (monospace, scrollable)
- Footer with controls (auto-scroll, copy, export)

**Log Levels:**
```typescript
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Color coding
const levelColors = {
  DEBUG: 'gray',
  INFO: 'blue',
  WARN: 'orange',
  ERROR: 'red'
};
```

**Log Entry Format:**
```
[19:30:45] INFO  [chat-service] Chat request completed (450ms, 150 tokens)
[19:30:46] ERROR [api-gateway] Connection timeout to database (5000ms)
```

### Chakra Components Used

```typescript
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Input,
  HStack,
  VStack,
  Box,
  Text,
  Badge,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Code,
  useClipboard,
  useToast
} from '@chakra-ui/react';
import { FiDownload, FiCopy, FiFilter } from 'react-icons/fi';
```

### Features Detail

**1. Service Selector**
```typescript
<Select placeholder="All Services" size="sm">
  <option value="all">All Services</option>
  <option value="api-gateway">API Gateway</option>
  <option value="chat-service">Chat Service</option>
  <option value="image-service">Image Service</option>
  <option value="tts-stt-service">TTS/STT Service</option>
</Select>
```

**2. Log Level Filter**
```typescript
<HStack spacing={2}>
  <Badge colorScheme="gray" cursor="pointer" onClick={() => toggleLevel('DEBUG')}>
    DEBUG
  </Badge>
  <Badge colorScheme="blue" cursor="pointer" onClick={() => toggleLevel('INFO')}>
    INFO
  </Badge>
  <Badge colorScheme="orange" cursor="pointer" onClick={() => toggleLevel('WARN')}>
    WARN
  </Badge>
  <Badge colorScheme="red" cursor="pointer" onClick={() => toggleLevel('ERROR')}>
    ERROR
  </Badge>
</HStack>
```

**3. Log Display**
```typescript
<Box
  bg={useColorModeValue('gray.50', 'gray.900')}
  borderRadius="md"
  p={4}
  h="500px"
  overflowY="auto"
  fontFamily="mono"
  fontSize="sm"
  ref={logContainerRef}
>
  {filteredLogs.map((log, i) => (
    <HStack key={i} spacing={2}>
      <Text color="gray.500">[{log.timestamp}]</Text>
      <Badge colorScheme={levelColors[log.level]} size="sm">
        {log.level}
      </Badge>
      <Text color="gray.600">[{log.service}]</Text>
      <Text>{log.message}</Text>
    </HStack>
  ))}
</Box>
```

**4. Auto-Scroll Control**
```typescript
<FormControl display="flex" alignItems="center">
  <FormLabel htmlFor="auto-scroll" mb="0">
    Auto-scroll
  </FormLabel>
  <Switch id="auto-scroll" isChecked={autoScroll} onChange={toggleAutoScroll} />
</FormControl>
```

**5. Copy/Export**
```typescript
const { onCopy, hasCopied } = useClipboard(logsAsText);
const toast = useToast();

<Button leftIcon={<FiCopy />} size="sm" onClick={onCopy}>
  {hasCopied ? 'Copied!' : 'Copy Logs'}
</Button>

<Button leftIcon={<FiDownload />} size="sm" onClick={exportLogs}>
  Export
</Button>
```

### Real-Time Log Streaming

**WebSocket Integration:**
```typescript
// hooks/useLogStream.ts (< 80 lines)
export function useLogStream(serviceId?: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/logs`);
    
    ws.onmessage = (event) => {
      const log = JSON.parse(event.data);
      if (!serviceId || log.service === serviceId) {
        setLogs(prev => [...prev.slice(-100), log]); // Keep last 100
      }
    };
    
    return () => ws.close();
  }, [serviceId]);
  
  return logs;
}
```

---

## 3. Settings/Config Page

### Design
Full-page settings interface for:
- LLM provider configuration
- Model selection and management
- Service configuration
- UI preferences

### Page Structure

**File:** `src/pages/Settings.tsx` (< 150 lines)

**Layout:**
- Sidebar with settings categories
- Main content area with forms
- Save/Cancel buttons at bottom

**Categories:**
1. LLM Provider
2. Models
3. Services
4. Appearance
5. Advanced

### Category 1: LLM Provider Configuration

**File:** `src/components/settings/LLMProviderSettings.tsx` (< 200 lines)

**Features:**
- Provider selection (Local/Cloud)
- Connection testing
- Fallback configuration
- Status indicators

**UI Design:**

```typescript
<VStack spacing={6} align="stretch">
  <FormControl>
    <FormLabel>Primary Provider</FormLabel>
    <Select value={primaryProvider} onChange={handleProviderChange}>
      <option value="lmstudio">LM Studio (Local)</option>
      <option value="ollama">Ollama (Local)</option>
      <option value="openai">OpenAI (Cloud)</option>
      <option value="anthropic">Anthropic (Cloud)</option>
    </Select>
  </FormControl>

  {primaryProvider === 'lmstudio' && (
    <FormControl>
      <FormLabel>LM Studio URL</FormLabel>
      <Input
        value={lmStudioUrl}
        onChange={(e) => setLmStudioUrl(e.target.value)}
        placeholder="http://localhost:1234/v1"
      />
      <FormHelperText>Default: http://localhost:1234/v1</FormHelperText>
    </FormControl>
  )}

  {primaryProvider === 'openai' && (
    <FormControl>
      <FormLabel>OpenAI API Key</FormLabel>
      <InputGroup>
        <Input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
        />
        <InputRightElement>
          <IconButton
            aria-label="Toggle visibility"
            icon={showKey ? <FiEyeOff /> : <FiEye />}
            onClick={() => setShowKey(!showKey)}
            variant="ghost"
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )}

  <Button
    leftIcon={<FiCheck />}
    colorScheme="blue"
    onClick={testConnection}
    isLoading={testing}
  >
    Test Connection
  </Button>

  {connectionStatus && (
    <Alert status={connectionStatus.success ? 'success' : 'error'}>
      <AlertIcon />
      {connectionStatus.message}
    </Alert>
  )}

  <Divider />

  <FormControl>
    <FormLabel>Fallback Provider</FormLabel>
    <Select value={fallbackProvider}>
      <option value="none">None</option>
      <option value="openai">OpenAI</option>
      <option value="anthropic">Anthropic</option>
    </Select>
    <FormHelperText>
      Used when primary provider is unavailable
    </FormHelperText>
  </FormControl>
</VStack>
```

### Category 2: Model Management

**File:** `src/components/settings/ModelManagement.tsx` (< 200 lines)

**Features:**
- List loaded models
- Load/unload models
- Model details (size, parameters)
- Download new models (for Ollama)

**UI Design:**

```typescript
<VStack spacing={4} align="stretch">
  <Heading size="md">Loaded Models</Heading>
  
  {loadedModels.map(model => (
    <Box
      key={model.id}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <HStack>
            <Text fontWeight="bold">{model.name}</Text>
            <Badge colorScheme="green">Loaded</Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            {model.size} • {model.parameters} parameters
          </Text>
        </VStack>
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={() => unloadModel(model.id)}
          isLoading={unloading === model.id}
        >
          Unload
        </Button>
      </HStack>
    </Box>
  ))}

  <Divider />

  <Heading size="md">Available Models</Heading>
  
  {availableModels.map(model => (
    <Box
      key={model.id}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">{model.name}</Text>
          <Text fontSize="sm" color="gray.600">
            {model.size} • {model.description}
          </Text>
        </VStack>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => loadModel(model.id)}
          isLoading={loading === model.id}
        >
          Load
        </Button>
      </HStack>
      {loading === model.id && (
        <Progress size="xs" isIndeterminate mt={2} />
      )}
    </Box>
  ))}
</VStack>
```

### Model Loading Progress

```typescript
// Real-time progress for model downloads
<Box>
  <HStack justify="space-between" mb={2}>
    <Text fontSize="sm">Downloading llama-3.1-8b...</Text>
    <Text fontSize="sm" color="gray.600">
      {downloadProgress}%
    </Text>
  </HStack>
  <Progress value={downloadProgress} size="sm" colorScheme="blue" />
  <Text fontSize="xs" color="gray.500" mt={1}>
    {formatBytes(downloaded)} / {formatBytes(total)} • {estimatedTime} remaining
  </Text>
</Box>
```

### Category 3: Service Configuration

**Features:**
- Enable/disable services
- Port configuration
- Auto-start settings
- Service restart controls

```typescript
<VStack spacing={4}>
  {services.map(service => (
    <HStack key={service.id} justify="space-between" w="full">
      <HStack>
        <Icon
          as={service.status === 'running' ? FiCheck : FiX}
          color={service.status === 'running' ? 'green.500' : 'red.500'}
        />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">{service.name}</Text>
          <Text fontSize="sm" color="gray.600">
            Port {service.port} • {service.status}
          </Text>
        </VStack>
      </HStack>
      <HStack>
        <Switch
          isChecked={service.enabled}
          onChange={() => toggleService(service.id)}
        />
        <IconButton
          aria-label="Restart service"
          icon={<FiRefreshCw />}
          size="sm"
          onClick={() => restartService(service.id)}
        />
      </HStack>
    </HStack>
  ))}
</VStack>
```

### Category 4: Appearance

**Features:**
- Theme selection (light/dark/auto)
- Color scheme
- Compact mode
- Animation preferences

```typescript
<VStack spacing={6}>
  <FormControl>
    <FormLabel>Theme</FormLabel>
    <RadioGroup value={theme} onChange={setTheme}>
      <HStack spacing={4}>
        <Radio value="light">Light</Radio>
        <Radio value="dark">Dark</Radio>
        <Radio value="system">System</Radio>
      </HStack>
    </RadioGroup>
  </FormControl>

  <FormControl>
    <FormLabel>Accent Color</FormLabel>
    <HStack>
      {colorSchemes.map(scheme => (
        <Box
          key={scheme}
          w={10}
          h={10}
          bg={`${scheme}.500`}
          borderRadius="md"
          cursor="pointer"
          border={accentColor === scheme ? '3px solid' : 'none'}
          borderColor="white"
          onClick={() => setAccentColor(scheme)}
        />
      ))}
    </HStack>
  </FormControl>

  <FormControl display="flex" alignItems="center">
    <FormLabel mb="0">Compact Mode</FormLabel>
    <Switch isChecked={compactMode} onChange={toggleCompactMode} />
  </FormControl>

  <FormControl display="flex" alignItems="center">
    <FormLabel mb="0">Enable Animations</FormLabel>
    <Switch isChecked={animations} onChange={toggleAnimations} />
  </FormControl>
</VStack>
```

---

## Data Flow & State Management

### Settings Store

**File:** `src/stores/settings.store.ts` (< 50 lines)

```typescript
interface SettingsState {
  llmProvider: {
    primary: 'lmstudio' | 'ollama' | 'openai' | 'anthropic';
    fallback: string;
    config: Record<string, any>;
  };
  models: {
    loaded: Model[];
    available: Model[];
  };
  services: Service[];
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    compactMode: boolean;
    animations: boolean;
  };
}

export const useSettingsStore = create<SettingsState>((set) => ({
  // ... state and actions
}));
```

### API Integration

**Settings endpoints:**
```typescript
// Get current settings
GET /api/settings

// Update settings
PUT /api/settings
Body: { llmProvider: {...}, models: {...} }

// Test LLM connection
POST /api/settings/llm/test
Body: { provider: 'lmstudio', config: {...} }

// Load model
POST /api/models/load
Body: { modelId: 'llama-3.1-8b' }

// Unload model
POST /api/models/unload
Body: { modelId: 'llama-3.1-8b' }

// Get available models
GET /api/models/available
```

---

## File Structure

```
src/
├── components/
│   ├── modals/
│   │   ├── HelpModal.tsx           # Help documentation modal
│   │   ├── LogViewerModal.tsx      # Log viewer modal
│   │   └── index.ts
│   └── settings/
│       ├── LLMProviderSettings.tsx # LLM provider config
│       ├── ModelManagement.tsx     # Model load/unload
│       ├── ServiceConfig.tsx       # Service settings
│       ├── AppearanceSettings.tsx  # Theme/UI settings
│       └── index.ts
├── pages/
│   └── Settings.tsx                # Settings page
├── stores/
│   └── settings.store.ts           # Settings state
└── hooks/
    ├── useLogStream.ts             # WebSocket logs
    └── useSettings.ts              # Settings management
```

---

## Implementation Priority

### Phase 1 (Week 2)
- HelpModal component
- Basic Settings page structure
- Appearance settings

### Phase 2 (Week 3-4)
- LogViewerModal component
- LLM Provider configuration
- Model Management UI

### Phase 3 (Post-MVP)
- WebSocket log streaming
- Real-time model download progress
- Service restart controls

---

## Related Documentation

- `FOLDER_STRUCTURE.md` - File locations
- `.cursorrules` - Component patterns
- `BACKEND_API.md` - Settings API endpoints
