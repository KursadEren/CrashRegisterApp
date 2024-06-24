import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { ThemeContext } from '../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen() {
  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: '',
    joined: '',
    profileImage: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('@current_user');
        const email = await AsyncStorage.getItem('@user_email');
        const username = await AsyncStorage.getItem('@user_username');
        const joined = await AsyncStorage.getItem('@user_joined');
        const profileImage = await AsyncStorage.getItem('@user_profile_image');

        setUserData({
          name: name || 'N/A',
          email: email || 'N/A',
          username: username || 'N/A',
          joined: joined || 'N/A',
          profileImage: profileImage || 'https://via.placeholder.com/100'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileImageChange = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };

    Alert.alert(
      "Select Image",
      "Choose the source for the image",
      [
        { text: "Camera", onPress: () => openCamera(options) },
        { text: "Gallery", onPress: () => openGallery(options) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async (options) => {
    const result = await launchCamera(options);
    handleImageResult(result);
  };

  const openGallery = async (options) => {
    const result = await launchImageLibrary(options);
    handleImageResult(result);
  };

  const handleImageResult = async (result) => {
    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.error) {
      console.log('ImagePicker Error: ', result.error);
    } else {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUserData(prevState => ({ ...prevState, profileImage: base64Image }));
      await AsyncStorage.setItem('@user_profile_image', base64Image);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfileImageChange}>
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.textColor }]}>{userData.name}</Text>
        <Text style={[styles.email, { color: theme.textColor }]}>{userData.email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="person" size={24} color={theme.textColor} />
          <Text style={[styles.infoText, { color: theme.textColor }]}>Username: {userData.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={24} color={theme.textColor} />
          <Text style={[styles.infoText, { color: theme.textColor }]}>Joined: {userData.joined}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryColor }]}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondaryColor }]}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: 'gray',
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
