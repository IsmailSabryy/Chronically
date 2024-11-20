import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

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
      style={styles.contentCard}
    >
      <Text style={styles.contentTitle}>{item.Tweet || item.headline}</Text>
      <Text style={styles.contentAuthor}>{item.Username || item.authors}</Text>
      <Text style={styles.contentDate}>{formatToUTCT(item.Created_At)}</Text>
    </TouchableOpacity>
  );

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
  contentCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contentAuthor: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  contentDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  contentDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default TrendingScreen;