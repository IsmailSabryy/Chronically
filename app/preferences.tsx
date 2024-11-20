import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

type IndustryType = string;

export default function PreferencesScreen() {
  const [selectedOptions, setSelectedOptions] = useState<IndustryType[]>([]);
  const [username, setUsername] = useState<string>('Guest');
  const router = useRouter();

  const industries: string[] = [
    'BREAKING NEWS', 'WORLDPOST', 'WORLD NEWS', 'WELLNESS', 'Football', 'Formula1',
    'POLITICS', 'U.S. NEWS', 'TRAVEL', 'THE WORLDPOST', 'TECH', 'Gaming', 'Health', 'Travel',
    'TASTE', 'STYLE & BEAUTY', 'STYLE', 'SPORTS', 'SCIENCE',
    'RELIGION', 'PARENTS', 'PARENTING', 'MONEY', 'WEDDINGS',
    'MEDIA', 'LATINO VOICES', 'IMPACT', 'HOME & LIVING',
    'HEALTHY LIVING', 'GREEN', 'GOOD NEWS', 'FOOD & DRINK', 'FIFTY',
    'ENVIRONMENT', 'ENTERTAINMENT', 'EDUCATION', 'DIVORCE',
    'CULTURE & ARTS', 'CRIME', 'COMEDY', 'COLLEGE', 'BUSINESS',
    'BLACK VOICES', 'ARTS', 'WOMEN',
  ];

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('http://localhost:3000/get-username');
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
  
    const fetchPreferences = async () => {
      try {
        if (username === 'Guest') return; // Ensure username is set
    
        const response = await fetch('http://localhost:3000/check-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });
    
        const data = await response.json();
    
        if (data.status === 'Success' && Array.isArray(data.data)) {
          const preferences = data.data.map((item) => item.preference);
          setSelectedOptions(preferences.length ? preferences : []);
        } else {
          setSelectedOptions([]); 
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setSelectedOptions([]); // Reset state on error
      }
    };
    
    const initializePreferences = async () => {
      await fetchUsername();
      if (username !== 'Guest') {
        await fetchPreferences();
      }
    };
  
    initializePreferences();
  }, [username]);
  

  const toggleOption = (option: IndustryType) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
    );
  };
  const handleResetPreferences = async () => {
    try {
      const response = await fetch('http://localhost:3000/delete-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
  
      if (response.ok) {
        setSelectedOptions([]); // Clear UI state
      } else {
        console.error('Error resetting preferences:', await response.json());
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };
  
  const handleViewClick = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert('No Preferences', 'Please select at least one preference.');
      return;
    }

    try {
      const addPreferencePromises = selectedOptions.map(async (preference) => {
        const response = await fetch('http://localhost:3000/add-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, preference }),
        });

        const data = await response.json();
        if (response.status === 409) {
          console.warn(data.message);
        } else if (response.status !== 200) {
          console.error('Error adding preference:', data.error);
        }
      });

      await Promise.all(addPreferencePromises);

      Alert.alert('Success', 'Your preferences have been saved.');
      router.push('/mynews');
    } catch (error) {
      console.error('Error handling view click:', error);
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  const renderOption = ({ item }: { item: IndustryType }) => {
    const isSelected = selectedOptions.includes(item);

    return (
      <TouchableOpacity
        style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
        onPress={() => toggleOption(item)}
      >
        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPreferences}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Hi {username},</Text>
        <Text style={styles.subHeading}>What are your preferences from X and other News Sources?</Text>

        {/* Industries Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Industries</Text>
          <FlatList
            data={industries}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOption}
            numColumns={3}
            columnWrapperStyle={styles.rowStyle}
            scrollEnabled={false}
          />
        </View>

        {/* VIEW Button */}
        <TouchableOpacity style={[styles.optionButton, styles.viewButton]} onPress={handleViewClick}>
          <Text style={[styles.optionText, styles.viewButtonText]}>VIEW</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 5,
    zIndex: 10, // Ensure it appears above other elements
    elevation: 5, // Adds shadow on Android
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rowStyle: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  selectedOptionButton: {
    backgroundColor: '#F7B8D2',
  },
  optionText: {
    color: '#007BFF',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#8A7FDC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewButton: {
    borderWidth: 1,
    borderColor: '#8A2BE2',
    marginTop: 20,
    alignSelf: 'center',
    width: '60%',
    backgroundColor: '#8A2BE2',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
