import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    password: '',
    biometricData: '',
    image: 'https://via.placeholder.com/100'
  });

  const fetchUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('@user_id');
      const username = await AsyncStorage.getItem('@current_user');
      const password = await AsyncStorage.getItem('@user_password');
      const biometricData = await AsyncStorage.getItem('@user_biometricData');
      const image = await AsyncStorage.getItem(`@user_profile_image_${username}`);
      setUserData({
        id: id || '',
        username: username || '',
        password: password || '',
        biometricData: biometricData || '',
        image: image || 'https://via.placeholder.com/100'
      });
    } catch (error) {
      console.error(t('errorFetchingData'), error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileImageChange = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    Alert.alert(
      t('selectImage'),
      t('chooseSource'),
      [
        { text: t('camera'), onPress: () => openCamera(options) },
        { text: t('gallery'), onPress: () => openGallery(options) },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const openCamera = async (options) => {
    const result = await launchCamera(options);
    if (result.didCancel) {
      console.log(t('userCancelled'));
    } else if (result.error) {
      console.log(t('imagePickerError'), result.error);
    } else {
      const uri = result.assets[0].uri;
      await clearAllImages();
      await saveImageLocally(uri);
      setUserData(prevState => ({ ...prevState, image: uri }));
    }
  };

  const openGallery = async (options) => {
    const result = await launchImageLibrary(options);
    if (result.didCancel) {
      console.log(t('userCancelled'));
    } else if (result.error) {
      console.log(t('imagePickerError'), result.error);
    } else {
      const uri = result.assets[0].uri;
      await clearAllImages();
      await saveImageLocally(uri);
      setUserData(prevState => ({ ...prevState, image: uri }));
    }
  };

  const clearAllImages = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('_profile.jpg')) {
          await RNFS.unlink(file.path);
        }
      }
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  };

  const saveImageLocally = async (uri) => {
    try {
      const fileName = `${userData.username}_profile.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.copyFile(uri, destPath);

      const fileUri = `file://${destPath}`;
      await AsyncStorage.setItem(`@user_profile_image_${userData.username}`, fileUri);
      setUserData(prevState => ({ ...prevState, image: fileUri }));
    } catch (error) {
      console.error('Error saving image locally:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfileImageChange}>
          <Image
            source={{ uri: userData.image }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.textColor }]}>{userData.username}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name='person' size={24} color={theme.textColor} />
          <Text style={[styles.infoText, { color: theme.textColor }]}>
            {t('username')}: {userData.username}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name='lock-closed' size={24} color={theme.textColor} />
          <Text style={[styles.infoText, { color: theme.textColor }]}>
            {t('password')}: {userData.password}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name='finger-print' size={24} color={theme.textColor} />
          <Text style={[styles.infoText, { color: theme.textColor }]}>
            {t('biometricData')}: {userData.biometricData}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryColor }]}>
          <Text style={styles.buttonText}>{t('editProfile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondaryColor }]}>
          <Text style={styles.buttonText}>{t('settings')}</Text>
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
