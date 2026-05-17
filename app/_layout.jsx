import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const Header = () => {
  const { logout } = useAuth()
  const router = useRouter()
  
  const handleLogout = () => {
    logout()
    router.replace('/login')
  }
  
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Header</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{flex:1}}>
          <Header />
          <Stack screenOptions={{ headerShown: false }}/>
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  )
}

export default RootLayout

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
})