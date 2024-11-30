import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const domaindynamo = Platform.OS === 'web'
  ?  'http://localhost:3000' // Use your local IP address for web
  : 'http://192.168.100.103:3000';       // Use localhost for mobile emulator or device

const TweetPage: React.FC = () => {
  const [tweetData, setTweetData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTweetLink();
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      const response = await fetch(`${domaindynamo}/get-username`);
      const data = await response.json();
      if (data.username) {
        setUsername(data.username);
      } else {
        setUsername('Guest');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername('Guest');
    }
  };

  const fetchTweetLink = async () => {
    try {
      const response = await fetch(`${domaindynamo}/get-tweet-link`);
      const data = await response.json();
      if (data.tweetLink) {
        fetchTweetDetails(data.tweetLink);
      } else {
        Alert.alert('Error', 'No tweet link set');
      }
    } catch (error) {
      console.error('Error fetching tweet link:', error);
      Alert.alert('Error', 'Unable to fetch tweet link');
    }
  };

  const fetchTweetDetails = async (link: string) => {
    try {
      const response = await fetch(`${domaindynamo}/get-tweet-by-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });
      const data = await response.json();
      if (data.status === 'Tweet found') {
        setTweetData(data.data);
      } else {
        Alert.alert('Error', 'No tweet found with the given link');
      }
    } catch (error) {
      console.error('Error fetching tweet details:', error);
      Alert.alert('Error', 'Unable to fetch tweet details');
    }
  };

  const fetchSharedContent = async () => {
    try {
      // Fetch the username dynamically
      const response = await fetch(`${domaindynamo}/get-username`);
      const data = await response.json();
      const username = data.username || 'Guest'; // Use 'Guest' if no username is found

      // Use the fetched username in your shared content logic
      if (username !== '') {
        // Proceed with fetching shared content or performing actions using username
        const sharedResponse = await fetch(`${domaindynamo}/fetch-shared-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        const sharedData = await sharedResponse.json();
        if (sharedData.success) {
          // Process the shared data
          console.log('Shared content fetched successfully');
          // Do something with sharedData...
        } else {
          console.error('Failed to fetch shared content');
        }
      } else {
        console.error('Username not found');
      }
    } catch (error) {
      console.error('Error fetching shared content:', error);
    }
  };

  const handleShare = async (tweetLink: string) => {
    if (username !== '') {
      try {
        await fetch(`${domaindynamo}/share_tweets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            tweet_link: tweetLink,
          }),
        });
        if (Platform.OS === 'web') {
          alert('Tweet shared successfully!');
        } else {
          Alert.alert('Success', 'Tweet shared successfully!');
        }
      } catch (error) {
        console.error('Error sharing article', error);
        Alert.alert('Error', 'Unable to share tweet');
      }
    }
  };

  const handleMediaPress = (tweetLink: string) => {
    Linking.openURL(tweetLink).catch((err) =>
      Alert.alert('Error', 'Failed to open tweet.')
    );
  };

  const handleSave = async (tweetLink: string) => {
    if (username !== '') {
      try {
        const response = await fetch(`${domaindynamo}/save-tweets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            tweet_link: tweetLink,
          }),
        });

        if (response.ok) {
          if (Platform.OS === 'web') {
            alert('Tweet saved successfully!');
          } else {
            Alert.alert('Success', 'Tweet saved successfully!');
          }
        } else {
          if (Platform.OS === 'web') {
            alert('Error: Tweet could not be saved');
          } else {
            Alert.alert('Error', 'Tweet could not be saved');
          }
        }
      } catch (error) {
        console.error('Error saving tweet', error);
        if (Platform.OS === 'web') {
          alert('Error: Unable to save tweet');
        } else {
          Alert.alert('Error', 'Unable to save tweet');
        }
      }
    } else {
      if (Platform.OS === 'web') {
        alert('Please log in to save tweets');
      } else {
        Alert.alert('Error', 'Please log in to save tweets');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>News Detail</Text>

      {tweetData ? (
        <>
          <View style={styles.tweetCard}>
            <View style={styles.tweetHeader}>
              <Image
                source={{ uri: 'https://via.placeholder.com/50' }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>{tweetData.Username}</Text>
                <Text style={styles.timestamp}>{tweetData.Created_At}</Text>
              </View>
            </View>
            <Text style={styles.tweetText}>{tweetData.Tweet}</Text>
            {tweetData.Media_URL && (
              <TouchableOpacity
                onPress={() => handleMediaPress(tweetData.Tweet_Link)}
              >
                <Image
                  source={{ uri: tweetData.Media_URL }}
                  style={styles.media}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            <View style={styles.stats}>
              <Text style={styles.stat}>
                Retweets: {tweetData.Retweets || 0}
              </Text>
              <Text style={styles.stat}>
                Likes: {tweetData.Favorites || 0}
              </Text>
            </View>
          </View>

          <Text style={styles.aiExplanationHeader}>AI Depth Explanation</Text>
          <Text style={styles.aiExplanationText}>{tweetData.Explanation}</Text>

          <View style={styles.actionIcons}>
            <TouchableOpacity onPress={() => handleSave(tweetData.Tweet_Link)}>
              <Icon name="bookmark-outline" size={30} color="#A1A0FE" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="chatbubble-outline" size={30} color="#A1A0FE" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleShare(tweetData.Tweet_Link)}
            >
              <Icon name="share-outline" size={30} color="#A1A0FE" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.loadingText}>Loading tweet details...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backIcon: {
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tweetCard: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  tweetText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  media: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  aiExplanationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiExplanationText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 20,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingText: {
    fontSize: 16,
    color: '#A1A0FE',
  },
});

export default TweetPage;