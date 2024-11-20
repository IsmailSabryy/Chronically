import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const domain = 'dev-1uzu6bsvrd2mj3og.us.auth0.com';
const clientId = 'CZHJxAwp7QDLyavDaTLRzoy9yLKea4A1';

const LoginScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const redirectUri = 'http://localhost:8081/preferences';

  const exchangeToken = async (code) => {
    const tokenEndpoint = `https://${domain}/oauth/token`;

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) throw new Error('Token exchange failed');

      const data = await response.json();

      const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!userInfoResponse.ok) throw new Error('User info fetch failed');

      const user = await userInfoResponse.json();
      setUserInfo(user);
      console.log('User Info:', user); // Display user info in the console
      return user;
    } catch (error) {
      console.error('Error during token exchange:', error);
      setErrorMessage('Failed to authenticate.');
      throw error;
    }
  };

  const handleUserRegistration = async (user) => {
    console.log('User Info:', user);
    const { sub: userId } = user;
    const url = 'http://localhost:3000/sign-up';

    try {
      const checkResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userId, password: 'test123' }),
      });

      const checkData = await checkResponse.json();

      if (checkData.message === 'Username is already registered') {
        const setUsernameResponse = await fetch('http://localhost:3000/set-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userId }),
        });

        const setUsernameData = await setUsernameResponse.json();

        if (setUsernameData.status === 'Username set successfully') {
          console.log('Username set successfully');
        } else {
          setErrorMessage('Failed to set username.');
        }

        router.push('/mynews');
      } else {
        router.push('/preferences');
      }
    } catch (error) {
      console.error('Error during user registration:', error);
      setErrorMessage('Failed to register user.');
    }
  };

  const handleLogin = () => {
    setLoading(true);
    setErrorMessage('');

    const authWindow = window.open(
      `https://${domain}/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid profile email&prompt=login`,
      'Auth0 Login',
      'width=500,height=600'
    );

    const interval = setInterval(() => {
      try {
        if (authWindow && authWindow.closed) {
          clearInterval(interval);
          setLoading(false);
        }

        if (authWindow && authWindow.location.href.includes(redirectUri)) {
          const params = new URL(authWindow.location.href).searchParams;
          const code = params.get('code');

          if (code) {
            clearInterval(interval);
            authWindow.close();
            exchangeToken(code)
              .then((user) => {
                handleUserRegistration(user);
              })
              .catch((error) => {
                setErrorMessage('Failed to complete login.');
                console.error(error);
              });
          }
        }
      } catch (error) {
        // Ignore cross-origin errors
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.titleLine1}>Login</Text>
      <Text style={styles.titleLine2}>to enter our news stream</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.buttonText}>Loading...</Text>
        ) : (
          <Text style={styles.buttonText}>Login with Auth0</Text>
        )}
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      {userInfo && (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>
            {JSON.stringify(userInfo, null, 2)}
          </Text>
        </View>
      )}
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
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  titleLine1: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleLine2: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  userInfo: {
    marginTop: 20,
  },
  userInfoText: {
    color: '#fff',
    fontSize: 14,
  },
});