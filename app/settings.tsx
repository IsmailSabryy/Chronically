import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const domaindynamo = Platform.OS === 'web'
  ?  'http://localhost:3000' // Use your local IP address for web
  : 'http://192.168.100.103:3000';       // Use localhost for mobile emulator or device

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(`${domaindynamo}/get-username`);
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
        } else {
          Alert.alert('Error', 'Failed to fetch username');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        Alert.alert('Error', 'Unable to fetch username');
      }
    };

    fetchUsername();
  }, []);

  const togglePushNotifications = () => {
    setIsPushNotificationsEnabled((prev) => !prev);
  };

  const deactivateAccount = () => {
    if (!username) {
      Alert.alert('Error', 'Username not available');
      return;
    }

    router.push('/home');

    fetch(`${domaindynamo}/deactivate-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).catch((error) => {
      console.error('Error deactivating account:', error);
    });
  };

  const deleteAccount = () => {
    if (!username) {
      Alert.alert('Error', 'Username not available');
      return;
    }
    router.push('/home');

    fetch('http://localhost:3000/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).catch((error) => {
      console.error('Error deleting account:', error);
    });
  };
  const logout = () => {
    
          router.push('/home'); 
       
  };
  
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>
        {username && <Text style={styles.greeting}>Hello, {username}</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
         <TouchableOpacity style={styles.button} onPress={logout}>
           <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('./preferences')}>
            <Text style={styles.buttonText}>Edit Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isPushNotificationsEnabled && styles.buttonActive]}
            onPress={togglePushNotifications}
          >
            <Text style={styles.buttonText}>
              Push Notifications {isPushNotificationsEnabled ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={deactivateAccount}>
            <Text style={styles.buttonText}>Deactivate Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={deleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#8A7FDC',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  backIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: '#8A7FDC',
    paddingHorizontal: 0, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%', 
  },
  button: {
    backgroundColor: '#E57373',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%', 
    alignSelf: 'stretch', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
