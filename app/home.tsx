import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';

const domain = 'dev-vybmc25ljbvs5mu6.us.auth0.com';
const clientId = 'vZGfiRpR9T87u5tKBhqZVUxeO2I6kJih';

const redirectUri = makeRedirectUri({
  scheme: 'expo',
  path: 'preferences',
});

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserRegistration = async (user) => {
    const { sub: token, nickname: Nickname, email: Email } = user;
    const url = 'http://localhost:3000/sign-up';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_token: token, nickname: Nickname, email: Email }),
      });

      const data = await response.json();
      if (data.message === 'Username or email is already registered') {
        const activationStatusResponse = await fetch('http://localhost:3000/check-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: Nickname, auth_token: token }),
        });

        const activationStatusData = await activationStatusResponse.json();
        if (activationStatusData.message === 'Account is deactivated') {
          router.push('/home');
        } else {
          router.push('/mynews');
        }
      } else {
        await fetch('http://localhost:3000/set-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: Nickname }),
        });
        router.push('/preferences');
      }
    } catch (error) {
      console.error('Error during user registration:', error);
      setErrorMessage('Failed to register user.');
    }
  };

  const exchangeToken = async (code) => {
    try {
      const tokenEndpoint = `https://${domain}/oauth/token`;
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
      await handleUserRegistration(user);
    } catch (error) {
      console.error('Error during token exchange:', error);
      setErrorMessage('Failed to authenticate.');
    }
  };

  const handleLogin = () => {
    if (Platform.OS !== 'web') {
      setErrorMessage('Login is not supported on non-web platforms yet.');
      return;
    }

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
            exchangeToken(code).catch((error) => {
              setErrorMessage('Failed to complete login.');
              console.error(error);
            });
          }
        }
      } catch {
        // Ignore cross-origin errors
      }
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <View style={styles.bottomContainer}>
            <View style={styles.box}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  {loading ? 'Loading...' : 'Login'}
                </Text>
              </TouchableOpacity>
              {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A7FDC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoImage: {
    width: width * 0.7,
    height: height * 0.15,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  box: {
    backgroundColor: '#F7B8D2',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
  },
  loginButton: {
    backgroundColor: '#8F80E0',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
