import { View, Text } from 'react-native'

import MyDataTable from '../Component/MyDataTable'
import MyFlatlist from '../Component/MyFlatlist'
import React, { useEffect, useState } from 'react';
import { getUsers } from '../Axios/Axios';
export default function BasketScreen() {
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Kullanıcıları almak için API çağrısını yap
    async function fetchUsers() {
      const usersData = await getUsers();
      setUsers(usersData);
    }

    fetchUsers();
  }, []);
  return (
    <View style={{flex:1}}>
      <MyDataTable/>
      <MyFlatlist/>
      <View style={{flex:1}}>
      <Text>User List</Text>
      <Text>
        {users.map(user => (
          <Text key={user.id}>{user.name}</Text>
        ))}
      </Text>
    </View>

    </View>
  )
}