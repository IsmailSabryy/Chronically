import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const TweetPage: React.FC = () => {
  const [tweetData, setTweetData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTweetLink();
  }, []);

  const fetchTweetLink = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-tweet-link');
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
      const response = await fetch('http://localhost:3000/get-tweet-by-link', {
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
              <Image
                source={{ uri: tweetData.Media_URL }}
                style={styles.media}
                resizeMode="contain"
              />
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
            <TouchableOpacity>
              <Icon name="heart-outline" size={30} color="#A1A0FE" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="chatbubble-outline" size={30} color="#A1A0FE" />
            </TouchableOpacity>
            <TouchableOpacity>
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
    backgroundColor: '#000000', // Black background for the tweet
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
    color: '#FFFFFF', // Set username color to white
  },
  timestamp: {
    fontSize: 12,
    color: '#CCCCCC', // Use a lighter gray for better contrast
  },
  tweetText: {
    fontSize: 16,
    color: '#FFFFFF', // Set tweet text color to white
    marginBottom: 10,
  },
  media: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stat: {
    fontSize: 14,
    color: '#CCCCCC', // Lighter gray for stats
  },
  aiExplanationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiExplanationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default TweetPage;
