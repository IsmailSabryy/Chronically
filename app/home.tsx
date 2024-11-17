import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCreateAccount = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
      <View style={styles.bottomContainer}>
        <View style={styles.box}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.registerText}>New to Chronically?</Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A7FDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 300,
    height: 100,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  box: {
    backgroundColor: '#F7B8D2',
    paddingVertical: 40,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  loginButton: {
    backgroundColor: '#8F80E0',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#333',
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: 'blue',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});
