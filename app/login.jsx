import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { login } from '../auth';
import CustomScreen from '../components/CustomScreen';
import CustomText from '../components/CustomText';   
import Spacer from '../components/Spacer';
import CustomButton from '../components/CustomButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email || !password) {
      if (!email) setEmailError('Please enter your email');
      if (!password) setPasswordError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (error) {
      if (error.message === "User not found") {
        setEmailError('Unknown email address');
      } else if (error.message === "Invalid username or password") {
        setPasswordError('Incorrect password');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomScreen style={{ backgroundColor: '#454545' }} role="main">
       
      <CustomText title>Log In</CustomText>
      <Spacer height={40} />
      <CustomText style={styles.label}>Email</CustomText>
      <TextInput 
        placeholder="Enter your email" 
        style={styles.input} 
        value={email}
        onChangeText={(text) => { setEmail(text); setEmailError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <CustomText style={styles.label}>Password</CustomText>
      <TextInput 
        placeholder="Enter your password" 
        style={styles.input} 
        value={password}
        onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
        secureTextEntry 
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      <CustomButton
        style={{margin: 20, width: '80%'}}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </CustomButton>

      <StatusBar style="auto" />
    </CustomScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 5,
    width: '80%',
    paddingHorizontal: 10,
  },
  label:{
    marginBottom: 5,
    fontWeight: 'bold',
    alignItems: 'flex-start',
    width: '80%',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    width: '80%',
  },
});