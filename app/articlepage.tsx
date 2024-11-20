import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const formatToUTCA = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const ArticlePage: React.FC = () => {
  const [articleData, setArticleData] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchArticleIdAndDetails();
  }, []);

  const fetchArticleIdAndDetails = async () => {
    try {
      const idResponse = await fetch('http://localhost:3000/get-article-id');
      if (!idResponse.ok) {
        throw new Error('Failed to fetch article ID');
      }
      const idData = await idResponse.json();
      if (!idData.articleId) {
        Alert.alert('Error', 'No article ID set');
        return;
      }
      await fetchArticleDetails(idData.articleId);
      fetchRelatedArticles(idData.articleId);
    } catch (error) {
      console.error('Error fetching article ID:', error);
      Alert.alert('Error', 'Unable to fetch article ID');
    }
  };

  const fetchArticleDetails = async (id: number) => {
    try {
      const response = await fetch('http://localhost:3000/get-article-by-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch article details');
      }

      const data = await response.json();
      if (data.status === 'Article found') {
        setArticleData(data.data);
      } else {
        Alert.alert('Error', 'No article found with the given ID');
      }
    } catch (error) {
      console.error('Error fetching article details:', error);
      Alert.alert('Error', 'Unable to fetch article details');
    }
  };

  const fetchRelatedArticles = async (id: number) => {
    try {
      const response = await fetch('http://localhost:3000/get-related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch related articles');
      }

      const data = await response.json();
      if (data.status === 'Success') {
        setRelatedArticles(data.data);
      } else {
        Alert.alert('Error', 'No related articles found');
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      Alert.alert('Error', 'Unable to fetch related articles');
    }
  };

  const handleLinkPress = (link: string) => {
    Linking.openURL(link).catch(() =>
      Alert.alert('Error', 'Failed to open article link.')
    );
  };

  const handleRelatedArticlePress = async (id: number) => {
    try {
      const response = await fetch('http://localhost:3000/set-article-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to set article ID');
      }

      const data = await response.json();
      if (data.status === 'Success') {
        router.push('/articlepage'); // Navigate to the article page
      } else {
        Alert.alert('Error', 'Failed to set the new article ID');
      }
    } catch (error) {
      console.error('Error setting article ID:', error);
      Alert.alert('Error', 'Unable to set article ID');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.header}>Article Detail</Text>

      {articleData ? (
        <View style={styles.articleCard}>
          <Text style={styles.headline}>{articleData.headline}</Text>
          <Text style={styles.category}>Category: {articleData.category}</Text>
          <Text style={styles.date}>Date: {formatToUTCA(articleData.date)}</Text>
          <Text style={styles.authors}>
            Authors: {articleData.authors || 'Unknown'}
          </Text>
          <Text style={styles.shortDescription}>
            {articleData.short_description}
          </Text>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => handleLinkPress(articleData.link)}
          >
            <Text style={styles.readMoreText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading article details...</Text>
      )}

      <Text style={styles.relatedHeader}>Related Articles</Text>
      {relatedArticles.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.relatedCard}
          onPress={() => handleRelatedArticlePress(article.id)}
        >
          <Text style={styles.relatedHeadline}>{article.headline}</Text>
          <Text style={styles.relatedCategory}>Category: {article.category}</Text>
        </TouchableOpacity>
      ))}
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
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  authors: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  shortDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  readMoreButton: {
    backgroundColor: '#A1A0FE',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  relatedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  relatedContainer: {
    flexDirection: 'row',
  },
  relatedCard: {
    backgroundColor: '#EAE6FA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  relatedHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  relatedCategory: {
    fontSize: 14,
    color: '#777',
  },
});

export default ArticlePage;
