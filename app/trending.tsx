import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomButton from '../components/ui/ChronicallyButton';

const TrendingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Trending');
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const fetchTrendingContent = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:3000/get_trending_tweets');
      const data = await response.json();
      if (data.status === 'Success') {
        setContent(data.data);
      } else {
        setContent([]);
        setErrorMessage('No trending content found.');
      }
    } catch (error) {
      setContent([]);
      setErrorMessage('Error fetching trending content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Trending') {
      fetchTrendingContent();
    } else if (activeTab === 'My News') {
      router.push('/mynews');
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const formatToUTCT = (isoDate: string) => {
    const date = new Date(isoDate);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

  const handleContentPress = async (item: any) => {
    // Check if the item is a tweet by presence of `Tweet_Link`
    if (item.Tweet_Link) {
      try {
        const response = await fetch('http://localhost:3000/set-tweet-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: item.Tweet_Link }),
        });

        const data = await response.json();
        if (data.status === 'Success') {
          router.push('/tweetpage');
        } else {
          Alert.alert('Error', 'Failed to set tweet link');
        }
      } catch (error) {
        console.error('Error setting tweet link:', error);
        Alert.alert('Error', 'Unable to set tweet link');
      }
    } else {
      Alert.alert('Error', 'Invalid content type');
    }
  };

  const renderContentCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        // Infer type by checking the presence of `Tweet_Link`
        if (item.Tweet_Link) handleContentPress(item);
      }}
      style={styles.tweetCard}
    >
        <Image source={{ uri: item.Media_URL }} style={styles.tweetImage} />
        <Text style={styles.tweetUsername}>{item.Username}</Text>
        <Text style={styles.tweetDate}>{formatToUTCT(item.Created_At)}</Text>
        <Text style={styles.tweetText} numberOfLines={3} ellipsizeMode="tail">
          {item.Tweet}
        </Text>
    </TouchableOpacity>
  );

  const [isButtonVisible, setIsButtonVisible] = useState(true);
  
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsButtonVisible(offsetY < 100);
  };

  const handleHomePress = () => {
    console.log(router.push('/mynews'));
  };

  const handleBookmarkPress = () => {
    router.push('/savedArticles');
  };

  const handleAddressBookPress = () => {
    router.push('/followingPage');
  };

  const handleSearchPress = () => {
    router.push('/searchPage');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'My News' && styles.activeTabButton]}
          onPress={() => handleTabChange('My News')}
        >
          <Text style={[styles.tabText, activeTab === 'My News' && styles.activeTabText]}>
            My News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Trending' && styles.activeTabButton]}
          onPress={() => handleTabChange('Trending')}
        >
          <Text style={[styles.tabText, activeTab === 'Trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsIcon}>
          <Icon name="settings-outline" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={content}
          renderItem={renderContentCard}
          keyExtractor={(item, index) => `${item.Tweet_Link || item.link}-${index}`}
          contentContainerStyle={styles.listContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  settingsIcon: {
    position: 'absolute',
    right: 20,
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  errorMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  listContainer: {
    paddingTop: 20,
  },
  tweetCard: {
    backgroundColor: '#2A2B2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    width: 500,
    alignSelf: 'center',
  },
  tweetUsername: {
    color: '#8A7FDC',
    fontSize: 18,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tweetText: {
    fontSize: 14,
    color: '#A9A9A9',
    lineHeight: 20,
  },
  tweetDate: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tweetImage: {
    height: 300,
    width: 'auto',
    resizeMode: 'contain',
  },
});

export default TrendingScreen;