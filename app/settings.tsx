import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);
  const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:3000/get-username');
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

  const toggleDarkTheme = () => {
    setIsDarkThemeEnabled((prev) => !prev);
  };

  const logout = () => {
    router.push('/home'); // Redirect to the home screen
  };

  const handleDeactivation = (nickname: string) => {
    // Handle deactivation logic here
    console.log(`Deactivating account for: ${nickname}`);
    router.push('/home');
  };

  const handleDeletion = (nickname: string) => {
    // Handle deletion logic here
    console.log(`Deleting account for: ${nickname}`);
    router.push('/home');
  };

  const confirmDeactivation = () => {
    if (Platform.OS === 'web') {
      const userConfirmed = window.confirm(
        'Account Deactivation\n\nAre you sure you want to deactivate your account?'
      );
      if (userConfirmed) {
        handleDeactivation(username!);
      }
      // No need to do anything if the user presses Cancel
    } else {
      Alert.alert(
        'Account Deactivation',
        'Are you sure you want to deactivate your account?',
        [
          { text: 'Cancel', onPress: () => console.log('Deactivation canceled') }, // Do nothing here
          { text: 'Deactivate', onPress: () => handleDeactivation(username!) },
        ],
        { cancelable: false }
      );
    }
  };

  const confirmDeletion = () => {
    if (Platform.OS === 'web') {
      const userConfirmed = window.confirm(
        'Account Deletion\n\nAre you sure you want to permanently delete your account? This action cannot be undone.'
      );
      if (userConfirmed) {
        handleDeletion(username!);
      }
      // No need to do anything if the user presses Cancel
    } else {
      Alert.alert(
        'Account Deletion',
        'Are you sure you want to permanently delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', onPress: () => console.log('Deletion canceled') }, // Do nothing here
          { text: 'Delete', onPress: () => handleDeletion(username!) },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={[styles.mainContainer, isDarkThemeEnabled && styles.darkTheme]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.profileName}>{username || 'User'}</Text>
      </View>

      <View style={styles.sidebar}>
        <ScrollView>
          {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./edit-profile')}>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./preferences')}>
            <Text style={styles.menuText}>Edit Preferences</Text>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.switchItem}>
            <Text style={styles.menuText}>Push Notifications</Text>
            <Switch
              value={isPushNotificationsEnabled}
              onValueChange={togglePushNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isPushNotificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          <View style={styles.switchItem}>
            <Text style={styles.menuText}>Dark Theme Mode</Text>
            <Switch
              value={isDarkThemeEnabled}
              onValueChange={toggleDarkTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkThemeEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./language-settings')}>
            <Text style={styles.menuText}>Language</Text>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('./faq-support')}>
            <Text style={styles.menuText}>FAQ's & Support</Text>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <Text style={styles.menuText}>Logout</Text>
            <Icon name="exit-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={confirmDeactivation}>
            <Text style={[styles.menuText, styles.dangerText]}>Deactivate Account</Text>
            <Icon name="alert-circle-outline" size={20} color="#E57373" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={confirmDeletion}>
            <Text style={[styles.menuText, styles.dangerText]}>Delete Account</Text>
            <Icon name="trash-outline" size={20} color="#E57373" />
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
    flexDirection: 'column',
    backgroundColor: '#8A7FDC',
  },
  darkTheme: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#6246EA',
    borderRadius: 20,
    padding: 20,
    margin: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dangerText: {
    color: '#E57373',
  },
});
