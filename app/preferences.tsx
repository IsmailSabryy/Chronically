import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';

type IndustryType = string;

export default function PreferencesScreen() {
  const [selectedOptions, setSelectedOptions] = useState<IndustryType[]>([]);

  const industries: IndustryType[] = [
    'Breaking News', 'Science', 'Politics', 'Business', 'Economics',
    'Health', 'Stocks', 'Weather', 'Arts', 'Culture',
    'Film', 'Others', 'Technology', 'Sports', 'Education',
    'Environment', 'History', 'Fashion', 'Travel', 'Literature','Football'
  ];

  const toggleOption = (option: IndustryType) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]
    );
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Hello ismailasabryy,</Text>
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
        <TouchableOpacity style={[styles.optionButton, styles.viewButton]}>
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
