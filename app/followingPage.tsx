import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList, Alert, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomButton from '../components/ui/ChronicallyButton';

const FollowingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Add Friends');
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [follower, setFollower] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsername();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Reposts') {
      router.push('/repostFeed');
    }
  };

  const handleUnfollow = async (followedUser: string) => {
    // Unfollow logic here
  };

  const updateFollow = async (followedUser: string) => {
    setIsButtonPressed(true);
    try {
      const response = await fetch('http://localhost:3000/follow_Users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower_username: follower, followed_username: followedUser }),
      });

      const errorCheck = await response.json();
      setErrorMessage(errorCheck.message);
    } catch (error) {
      setErrorMessage('Failed to follow user.');
    }
  };

  const fetchUsername = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-username');
      const data = await response.json();
      if (data.username) {
        setFollower(data.username);
        fetchContent(data.username);
      } else {
        setFollower('');
        setFollowedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setFollowedUsers([]);
    }
  };

  const fetchContent = async (user: string) => {
    try {
      const followingResponse = await fetch('http://localhost:3000/get_followed_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });

      const followedUsers = await followingResponse.json();
      setFollowedUsers(followedUsers);
    } catch (error) {
      console.error('Error fetching content:', error);
      setFollowedUsers([]);
    }
  };

  const renderFollowedCard = ({ item }: any) => {
    return (
      <View style={styles.followedCard}>
        <View style={styles.cardContent}>
          <Ionicons name="person" size={30} style={styles.userIcon} />
          <Text style={styles.userName}>{item.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => handleUnfollow(item.username)}
        >
          <Ionicons name="close" size={20} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsButtonVisible(offsetY < 100);
  };

  const handleHomePress = () => {
    console.log(router.push('/mynews'));
  };

  const handleBookmarkPress = () => {
    console.log('Bookmark button pressed!');
  };

  const handleAddressBookPress = () => {
    // Do nothing or implement functionality
  };

  const handleSearchPress = () => {
    console.log('Search button pressed!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Add Friends' && styles.activeTabButton]}
            onPress={() => handleTabChange('Add Friends')}
          >
            <Text style={[styles.tabText, activeTab === 'Add Friends' && styles.activeTabText]}>
              Add Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Reposts' && styles.activeTabButton]}
            onPress={() => handleTabChange('Reposts')}
          >
            <Text style={[styles.tabText, activeTab === 'Reposts' && styles.activeTabText]}>
              Reposts
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsIcon}>
          <Icon name="settings-outline" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter username to follow"
          placeholderTextColor="#888"
          value={searchUsername}
          onChangeText={setSearchUsername}
        />
        <TouchableOpacity style={styles.followButton} onPress={() => updateFollow(searchUsername)}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </View>

      {isButtonPressed && errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <FlatList
        data={followedUsers}
        renderItem={renderFollowedCard}
        keyExtractor={(item, index) => `${item.username}-${index}`}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {isButtonVisible && (
        <CustomButton
          barButtons={[
            { iconName: 'home', onPress: handleHomePress },
            { iconName: 'bookmark', onPress: handleBookmarkPress },
            { iconName: 'address-book', onPress: handleAddressBookPress },
            { iconName: 'search', onPress: handleSearchPress },
          ]}
        />
      )}
    </View>
  );
};

export default FollowingPage;

const styles = StyleSheet.create({
  logoImage: {
    width: 300,
    height: 100,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  tabButton: {
    marginHorizontal: 20,
    paddingBottom: 5,
  },
  tabText: {
    fontSize: 18,
    color: '#888',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#A1A0FE',
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  settingsIcon: {
    position: 'absolute',
    right: 20,
  },
  followedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
  },
  userIcon: {
    marginRight: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeIcon: {
    color: 'red',
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 80,
    backgroundColor: '#f9f9f9',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    color: '#000',
  },
  followButton: {
    marginLeft: 10,
    backgroundColor: '#A1A0FE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginLeft: 20,
    fontSize: 14,
  },
});