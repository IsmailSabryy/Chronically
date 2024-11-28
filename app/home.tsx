import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const domain = 'dev-vybmc25ljbvs5mu6.us.auth0.com';
const clientId = 'vZGfiRpR9T87u5tKBhqZVUxeO2I6kJih';
const redirectUri = 'http://localhost:8081/loginStatus';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserRegistration = async (user) => {
      console.log('User Info:', user);
      const { sub: token, nickname: Nickname, email: Email } = user;
      console.log('Token:', token);
      console.log('Nickname:', Nickname);
      console.log('Email:', Email);
      const url = 'http://localhost:3000/sign-up';

      try {
        const checkResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth_token: token, nickname: Nickname, email: Email }),
        });

        const checkData = await checkResponse.json();

            const setUsernameResponse = await fetch('http://localhost:3000/set-username', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: Nickname }),
                        });

                        const setUsernameData = await setUsernameResponse.json();
                        console.log('Username set successfully');
                        router.push('/mynews');

        if (checkData.message === 'Username or email is already registered') {

            const activationstatus = await fetch('http://localhost:3000/check-login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({  username: Nickname , auth_token: token }),
                    });

            const activationstatusData = await activationstatus.json();

            if(activationstatusData.message === 'Account is deactivated'){
                router.push('/home');
                }else { router.push('/mynews'); }

        }
             else {
          router.push('/preferences');
        }
      } catch (error) {
        console.error('Error during user registration:', error);
        setErrorMessage('Failed to register user.');
      }
    };

  const exchangeToken = async (code: string) => {
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
      await handleUserRegistration(user);
    } catch (error) {
      console.error('Error during token exchange:', error);
      setErrorMessage('Failed to authenticate.');
      throw error;
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
      <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
      <View style={styles.bottomContainer}>
        <View style={styles.box}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginText}>Loading...</Text>
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>
          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
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
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});