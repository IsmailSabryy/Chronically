import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const loginResponse = await fetch('http://localhost:3000/check-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const loginData = await loginResponse.json();
  
      if (loginData.status === 'Success') {
        // Call the /set-username endpoint
        const setUsernameResponse = await fetch('http://localhost:3000/set-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
  
        const setUsernameData = await setUsernameResponse.json();
  
        if (setUsernameData.status === 'Username set successfully') {
          setSuccessMessage('Login successful');
          setTimeout(() => {
            router.push('/mynews');
          }, 1000);
        } else {
          setErrorMessage('Login successful but failed to set username');
        }
      } else if (loginData.status === 'Error') {
        setErrorMessage('Invalid username or password');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.titleLine1}>Login</Text>
      <Text style={styles.titleLine2}>to enter our news stream</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="white"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="white"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.buttonText}>Loading...</Text>
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <Text style={styles.successMessage}>{successMessage}</Text>
      ) : null}
      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.createAccountText}>Create to enter the stream</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A7FDC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    position: 'relative',
  },
  backIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  titleLine1: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  titleLine2: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '50%',
    height: 50,
    backgroundColor: '#F7B8D2',
    borderRadius: 25,
    paddingLeft: 20,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#8A7FDC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  accountText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: 'blue',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
  },
});
