import { View, Text,TouchableOpacity } from 'react-native'
import React from 'react'
import { Card } from 'react-native-paper'

export default function MyCard({CardName,CardColor}) {

    const onPressCard = () => {
        // Burada başka bir sayfaya geçiş yapmak için navigation.navigate() fonksiyonunu kullanabilirsiniz.
        // Örneğin, "Details" adında bir sayfaya geçmek için:
        navigation.navigate('Details', { cardName: CardName }); // Details, hedef sayfanın adı, cardName ise göndermek istediğiniz veri
      }
      return(
   
    <TouchableOpacity  onPress={onPressCard} style={{flex:1, marginHorizontal:10,backgroundColor:`${CardColor}`, width:30, height:100 ,alignItems:"center", justifyContent:"center",
    borderRadius:10, borderWidth:0.2
     }}
      >
        <Text>
            {CardName}
        </Text>
    </TouchableOpacity>
  
  )
}