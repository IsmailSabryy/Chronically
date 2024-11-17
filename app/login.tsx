import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

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
      const response = await fetch('http://localhost:3000/check-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.status === 'Success') {
        setSuccessMessage('Login successful');
        setTimeout(() => {
          router.push('/home'); 
        }, 1000);
      } else if (data.status === 'Error') {
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
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
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
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <Text style={styles.successMessage}>{successMessage}</Text>
      ) : null}
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.createAccountText}>Don't have an account? Create one</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F7B8D2',
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#8F80E0',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
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
