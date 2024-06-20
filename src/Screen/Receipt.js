import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, TextInput, BackHandler, useWindowDimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';

const Receipt = ({ route }) => {
  const { data2List, bagCount, bagCost } = route.params;
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [change, setChange] = useState(0);
  const [campaignDiscount, setCampaignDiscount] = useState(0);
  const navigation = useNavigation();
  const { serviceStatus } = useServiceStatus();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalItems = 0;

    data2List.forEach(item => {
      subtotal += item.price * item.count;
      totalItems += item.count;
    });

    return {
      subtotal,
      total: subtotal - campaignDiscount + bagCost,
      totalItems,
    };
  };

  const { subtotal, total, totalItems } = calculateTotals();

  const handlePayment = async () => {
    const currentDate = new Date();
    const options = { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  
    let totalPaid = parseFloat(cashAmount || 0) + parseFloat(cardAmount || 0);
    if (totalPaid >= total) {
      setChange(totalPaid - total);
      const paymentDetails = {
        date: currentDate.toLocaleString('tr-TR', options),
        items: data2List,
        subtotal: subtotal,
        total: total,
        totalItems: totalItems,
        paymentType: paymentType,
        cashAmount: parseFloat(cashAmount || 0),
        cardAmount: parseFloat(cardAmount || 0),
        change: totalPaid - total,
        bagCount: bagCount, // Poşet sayısı
        bagCost: bagCost, // Poşet maliyeti
        campaignDiscount: campaignDiscount, // Kampanya indirimi
        saleDate: currentDate.toLocaleString('tr-TR', options), // Satılma tarihi
        centralSendTime: serviceStatus ? currentDate.toLocaleString('tr-TR', options) : null,
        sentToCentral: serviceStatus, // Merkeze gönderildi durumu
        pdfPath: null // Başlangıçta null olarak ayarlanmış PDF yolu
      };
  
      try {
        await AsyncStorage.setItem('@payment_' + currentDate.getTime(), JSON.stringify(paymentDetails));
        if (!serviceStatus) {
          // Servis durumu çevrim içi olduğunda güncellemek için AsyncStorage'da kaydet
          await AsyncStorage.setItem('@pendingPayment_' + currentDate.getTime(), JSON.stringify(paymentDetails));
        }
      } catch (e) {
        console.log('Error saving payment details:', e);
      }
  
      setModalVisible(false);
      navigation.navigate('ReceiptPrint', { paymentDetails });
    } else {
      alert("Ödenen miktar toplamdan az olamaz");
    }
  };

  const applyCampaign1 = () => {
    let discount = 0;
    data2List.forEach(item => {
      const discountCount = Math.floor(item.count / 3);
      discount += discountCount * item.price;
    });
    setCampaignDiscount(discount);
  };
  
  const applyCampaign2 = () => {
    let discount = 0;
    data2List.forEach(item => {
      if (item.count >= 5) {
        discount += item.price * 0.2 * item.count; // %20 indirim
      }
    });
    setCampaignDiscount(discount);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.campaignButtonContainer}>
        <TouchableOpacity style={[styles.campaignButton, { backgroundColor: theme.primaryColor }]} onPress={applyCampaign1}>
          <Text style={styles.campaignButtonText}>3 Al 2 Öde</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.campaignButton, { backgroundColor: theme.primaryColor }]} onPress={applyCampaign2}>
          <Text style={styles.campaignButtonText}>5 Al %20 İndirim</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flex: 2 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>Product</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>Price</Text>
        </View>
        <View style={{ flex: 0.5 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>Count</Text>
        </View>
      </View>

      <FlatList
        data={data2List}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.itemBackground }]}>
            <View style={{ flex: 2 }}>
              <Text style={[styles.itemText, { color: theme.textColor }]}>{item.name}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemText, { color: theme.textColor }]}>{item.price}</Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Text style={[styles.itemText, { color: theme.textColor }]}>x{item.count}</Text>
            </View>
          </View>
        )}
        style={{ flex: 10 }}
      />

      <View style={[styles.totalContainer, isLandscape && styles.totalContainerLandscape, { backgroundColor: theme.totalBackground }]}>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Ara Toplam:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Toplam Kampanya İndirimi:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{campaignDiscount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Toplam Poşet Maliyeti:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{bagCost.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Toplam:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Toplam Ürün Sayısı:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{totalItems}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>Para Üstü:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{change.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentButton, { backgroundColor: theme.primaryColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.paymentButtonText}>Ödeme Yap</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingVertical: height * 0.05 }]}>
          <ScrollView contentContainerStyle={[styles.scrollViewContent, { paddingVertical: height * 0.1 }]}>
            <View style={[styles.modalContent, { height: isLandscape ? '100%' : '100%', width: isLandscape ? '100%' : '100%', backgroundColor: theme.modalBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Ödeme Yöntemi Seç</Text>

              <TouchableOpacity
                style={[styles.modalButton, paymentType === 'cash' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => setPaymentType('cash')}
              >
                <Text style={[styles.modalButtonText, { color: theme.textColor }]}>Nakit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, paymentType === 'card' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => setPaymentType('card')}
              >
                <Text style={[styles.modalButtonText, { color: theme.textColor }]}>Kart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, paymentType === 'both' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => setPaymentType('both')}
              >
                <Text style={[styles.modalButtonText, { color: theme.textColor }]}>Hem Kart Hem Nakit</Text>
              </TouchableOpacity>

              {paymentType !== '' && (
                <View>
                  {paymentType === 'cash' && (
                    <TextInput
                      style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                      placeholder="Nakit Miktarı"
                      keyboardType="numeric"
                      value={cashAmount}
                      onChangeText={setCashAmount}
                      placeholderTextColor={theme.placeholderTextColor}
                    />
                  )}
                  {paymentType === 'card' && (
                    <TextInput
                      style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                      placeholder="Kart Miktarı"
                      keyboardType="numeric"
                      value={cardAmount}
                      onChangeText={setCardAmount}
                      placeholderTextColor={theme.placeholderTextColor}
                    />
                  )}
                  {paymentType === 'both' && (
                    <View>
                      <TextInput
                        style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                        placeholder="Nakit Miktarı"
                        keyboardType="numeric"
                        value={cashAmount}
                        onChangeText={setCashAmount}
                        placeholderTextColor={theme.placeholderTextColor}
                      />
                      <TextInput
                        style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                        placeholder="Kart Miktarı"
                        keyboardType="numeric"
                        value={cardAmount}
                        onChangeText={setCardAmount}
                        placeholderTextColor={theme.placeholderTextColor}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.buttonBackground }]}
                    onPress={handlePayment}
                  >
                    <Text style={[styles.submitButtonText, { color: theme.textColor }]}>Ödeme Yap</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  campaignButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  campaignButton: {
    padding: 10,
    borderRadius: 5,
  },
  campaignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    marginTop: 3,
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    borderTopColor: '#555',
    borderBottomColor: '#555',
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
  },
  item: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: '#555',
  },
  itemText: {},
  totalContainer: {
    borderWidth: 2,
    borderColor: '#555',
    marginBottom: 3,
    padding: 10,
    borderRadius: 10,
  },
  totalContainerLandscape: {
    padding: 5,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalText: {
    fontSize: 22,
  },
  totalTextLandscape: {
    fontSize: 16,
  },
  paymentButton: {
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentButtonText: {
    color: "white",
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 26,
    marginBottom: 20,
  },
  modalButton: {
    padding: 20,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  selectedButton: {},
  modalButtonText: {
    fontSize: 18,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    borderRadius: 5,
    fontSize: 18,
  },
  submitButton: {
    marginTop: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  submitButtonText: {
    fontSize: 20,
  },
});

export default Receipt;
