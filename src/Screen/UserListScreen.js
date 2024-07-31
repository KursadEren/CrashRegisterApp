import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyFlatlist from "../Component/MyFlatlist";
import { API_URL2 } from "../GroceryData/Constant";

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL2}/users/users`);
        const usersWithImages = await addImagesToUsers(response.data);
        setUsers(usersWithImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);
  
  const addImagesToUsers = async (users) => {
    const usersWithImages = [];
    for (const user of users) {
      const image = await AsyncStorage.getItem(`@user_profile_image_${user.username}`);
      usersWithImages.push({ ...user, image: image || 'https://via.placeholder.com/100' });
    }
    return usersWithImages;
  };
  

  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MyFlatlist
        data={users}

        users={true}
        onItemSelect={(item) => console.log('Selected:', item)}
        onItemRemove={(item) => console.log('Removed:', item)}
        onAddToCart={(item) => console.log('Added to Cart:', item)}
        favoriteList={false}
        isProductList={false}
        information={'info'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserListScreen;
