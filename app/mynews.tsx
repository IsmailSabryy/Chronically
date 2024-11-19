import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('My News');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articlesAndTweets, setArticlesAndTweets] = useState<any[]>([]);
  const [isSeeAll, setIsSeeAll] = useState(false); // Track if "See All" is selected
  const router = useRouter();

  const fetchUsername = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-username');
      const data = await response.json();
      if (data.username) {
        fetchPreferences(data.username);
      } else {
        setPreferences([]);
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setPreferences([]);
    }
  };

  const fetchPreferences = async (username: string) => {
    try {
      const response = await fetch('http://localhost:3000/check-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.status === 'Success') {
        const fetchedPreferences = data.data.map((item: any) => item.preference);
        setPreferences(fetchedPreferences);
        setSelectedCategory(fetchedPreferences[0]); // Default to the first preference
        fetchContent(fetchedPreferences[0]); // Fetch articles and tweets for the default category
      } else {
        setPreferences([]);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setPreferences([]);
    }
  };

  // Fetch articles and tweets for a category
  const fetchContent = async (category: string) => {
    try {
      const [articlesResponse, tweetsResponse] = await Promise.all([
        fetch(
          isSeeAll
            ? 'http://localhost:3000/get-allarticles'
            : 'http://localhost:3000/get-articles',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category }),
          }
        ),
        fetch(
          isSeeAll
            ? 'http://localhost:3000/get-alltweets'
            : 'http://localhost:3000/get-tweets',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category }),
          }
        ),
      ]);

      const articlesData = await articlesResponse.json();
      const tweetsData = await tweetsResponse.json();

      if (articlesData.status === 'Articles found' || tweetsData.status === 'Tweets found') {
        const combinedContent = [
          ...(articlesData.data || []).map((item: any) => ({ type: 'article', ...item })),
          ...(tweetsData.data || []).map((item: any) => ({ type: 'tweet', ...item })),
        ];

        setArticlesAndTweets(combinedContent.sort(() => Math.random() - 0.5)); // Shuffle content
      } else {
        setArticlesAndTweets([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setArticlesAndTweets([]);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Trending') {
      router.push('/trending');
    }
  };

  const handleCategorySelect = (category: string) => {
    setIsSeeAll(false); // Reset "See All" when selecting a category
    setSelectedCategory(category);
    fetchContent(category);
  };

  const handleSeeAll = () => {
    setIsSeeAll(true);
    if (selectedCategory) {
      fetchContent(selectedCategory);
    }
  };

  const renderContentCard = ({ item }: { item: any }) => {
    if (item.type === 'article') {
      return (
        <View style={styles.articleCard}>
          <Text style={styles.articleTitle}>{item.headline}</Text>
          <Text style={styles.articleAuthor}>{item.authors}</Text>
          <Text style={styles.articleDate}>{item.date}</Text>
          <Text style={styles.articleDescription}>{item.short_description}</Text>
        </View>
      );
    } else if (item.type === 'tweet') {
      return (
        <View style={styles.tweetCard}>
          <Text style={styles.tweetUsername}>{item.Username}</Text>
          <Text style={styles.tweetText}>{item.Tweet}</Text>
          <Text style={styles.tweetDate}>{item.Created_At}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
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
      </View>

      {/* Category Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <View style={styles.categoryWrapper}>
            {preferences.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.filterTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.filterButton, isSeeAll && styles.filterButtonActive]}
              onPress={handleSeeAll}
            >
              <Text style={[styles.filterText, isSeeAll && styles.filterTextActive]}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Articles and Tweets */}
      <FlatList
        data={articlesAndTweets}
        renderItem={renderContentCard}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  filterContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  filterScroll: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryWrapper: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#A1A0FE',
  },
  filterText: {
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  articleCard: {
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  articleAuthor: {
    fontSize: 12,
    color: '#777777',
  },
  articleDate: {
    fontSize: 12,
    color: '#777777',
  },
  articleDescription: {
    fontSize: 14,
    color: '#555555',
    marginTop: 5,
  },
  tweetCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
  },
  tweetUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  tweetText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 5,
  },
  tweetDate: {
    fontSize: 12,
    color: '#777777',
  },
});

export default HomePage;
