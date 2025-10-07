import { useCallback } from 'react'
import { HStack, IconButton, Button, Text } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiRefreshCw, FiSettings, FiLogOut, FiHome } from 'react-icons/fi'

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDashboard = location.pathname === '/'
  
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const handleSettings = useCallback(() => {
    // TODO: Open settings modal
    console.log('Settings clicked')
  }, [])

  const handleLogout = useCallback(() => {
    // TODO: Implement logout
    console.log('Logout clicked')
  }, [])

  const handleDashboard = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <HStack 
      gap={2} 
      justify="space-between" 
      p={4} 
      bg="white" 
      _dark={{ bg: 'gray.800' }} 
      shadow="sm"
      role="banner"
      aria-label="Dashboard toolbar"
    >
      <HStack gap={2}>
        {!isDashboard && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDashboard}
          >
            <HStack gap={1}>
              <FiHome />
              <Text>Dashboard</Text>
            </HStack>
          </Button>
        )}
      </HStack>
      
      <HStack gap={2}>
        <IconButton
          aria-label="Refresh dashboard data"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
        >
          <FiRefreshCw />
        </IconButton>
        
        <IconButton
          aria-label="Open settings"
          variant="ghost"
          size="sm"
          onClick={handleSettings}
        >
          <FiSettings />
        </IconButton>
        
        <IconButton
          aria-label="Logout from dashboard"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
        >
          <FiLogOut />
        </IconButton>
      </HStack>
    </HStack>
  )
}
