import { View, Text } from 'react-native'
import React,{useContext} from 'react'
import MyCard from '../Component/MyCard'
import { ThemeContext } from '../Context/ThemeContext';
export default function AllReports({navigation}) {
    const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={{flex:1}}>
        <View style={{flex:1}}>
       
        <MyCard navigation={navigation} CardName="Ödeme Raporları" CardPage="Reports" CardColor={theme.primaryColor} IconName="file-chart-outline" />
        
        <MyCard navigation={navigation} CardName="Kullanıcılar" CardPage="Reports" CardColor={theme.primaryColor} IconName="file-chart-outline" />
        <MyCard navigation={navigation} CardName="Kampanyalar" CardPage="Reports" CardColor={theme.primaryColor} IconName="file-chart-outline" />
         </View>
    </View>
  )
}