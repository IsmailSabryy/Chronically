import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const calculateAge = (year: string, month: string, day: string) => {
    const today = new Date();
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword || !selectedYear || !selectedMonth || !selectedDay) {
      setErrorMessage('Please fill in all fields');
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
  
    const age = calculateAge(selectedYear, selectedMonth, selectedDay);
    if (age < 13) {
      setErrorMessage('You must be at least 13 years old to sign up');
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const response = await fetch('http://localhost:3000/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          dob: `${selectedYear}-${selectedMonth}-${selectedDay}`,
        }),
      });
  
      const data = await response.json();
  
      if (data.status === 'Success') {
        // Set username on the server
        await fetch('http://localhost:3000/set-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
  
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/preferences');
        }, 1000);
      } else if (data.status === 'Error') {
        setErrorMessage(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRange = (start: number, end: number) => {
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i.toString());
    }
    return range;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.titleLine1}>Sign Up</Text>
      <Text style={styles.titleLine2}>to join our news stream</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="white"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="white"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        placeholderTextColor="white"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.dobContainer}>
      <View style={styles.dobPicker}>
          <Picker
            selectedValue={selectedDay}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Day" value="" />
            {generateRange(1, 31).map((day) => (
              <Picker.Item key={day} label={day.padStart(2, '0')} value={day.padStart(2, '0')}  />
            ))}
          </Picker>
        </View>
       

        <View style={styles.dobPicker}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Month" value="" />
            {generateRange(1, 12).map((month) => (
              <Picker.Item key={month} label={month.padStart(2, '0')} value={month.padStart(2, '0')} />
            ))}
          </Picker>
        </View>

        <View style={styles.dobPicker}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Year" value="" />
            {generateRange(1900, new Date().getFullYear()).map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.buttonText}>Loading...</Text>
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.createAccountText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A7FDC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  pickerItem: {
    color: 'white', 
    fontSize: 16,
  },
  backIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  titleLine1: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  titleLine2: {
    fontSize: 18,
    color: 'white',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  label: {
    alignSelf: 'flex-start',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: '25%',
    
  },
  input: {
    width: '50%',
    height: 50,
    backgroundColor: '#F7B8D2',
    borderRadius: 25,
    paddingLeft: 20,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  dobContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 20,
  },
  dobPicker: {
    flex: 1,
    alignItems: 'center',
    color: 'white',
  },
  pickerLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  picker: {
    width: '50%',
    height: 50,
    backgroundColor: '#F7B8D2',
    borderRadius: 25, 
  },
  signUpButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#8A7FDC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountContainer: {
    alignItems: 'center',
  },
  accountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: 'blue',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
  },
});
