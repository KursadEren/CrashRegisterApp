import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import MyFlatlist from "../Component/MyFlatlist"; // MyFlatlist bileşeninizin doğru yolu ile içe aktarın
import API_URL2 from "../GroceryData/Constant"
const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL2}/users/users`);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
        showSearchInput={true}
        Touch={true}
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
