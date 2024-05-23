import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, TextInput, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Receipt = ({ route }) => {
  const { data2List } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [change, setChange] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    data2List.forEach(item => {
      subtotal += item.price * item.count;
    });
    return {
      subtotal,
      total: subtotal,
    };
  };

  const { subtotal, total } = calculateTotals();

  const handlePayment = () => {
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
        paymentType: paymentType,
        cashAmount: parseFloat(cashAmount || 0),
        cardAmount: parseFloat(cardAmount || 0),
        change: totalPaid - total,
      };

      setModalVisible(false);
      navigation.navigate('ReceiptPrint', { paymentDetails });
    } else {
      alert("Ödenen miktar toplamdan az olamaz");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 2 }}>
          <Text style={styles.headerText}>Product</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>Price</Text>
        </View>
        <View style={{ flex: 0.5 }}>
          <Text style={styles.headerText}>Count</Text>
        </View>
      </View>

      <FlatList
        data={data2List}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 2 }}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{item.price}</Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Text style={styles.itemText}>x{item.count}</Text>
            </View>
          </View>
        )}
        style={{ flex: 10 }}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Ara Toplam: {subtotal.toFixed(2)}</Text>
        <Text style={styles.totalText}>Toplam: {total.toFixed(2)}</Text>
        <Text style={styles.totalText}>Para Üstü: {change.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.paymentButton}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ödeme Yöntemi Seç</Text>

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'cash' && styles.selectedButton]}
              onPress={() => setPaymentType('cash')}
            >
              <Text style={styles.modalButtonText}>Nakit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'card' && styles.selectedButton]}
              onPress={() => setPaymentType('card')}
            >
              <Text style={styles.modalButtonText}>Kart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'both' && styles.selectedButton]}
              onPress={() => setPaymentType('both')}
            >
              <Text style={styles.modalButtonText}>Hem Kart Hem Nakit</Text>
            </TouchableOpacity>

            {paymentType !== '' && (
              <View>
                {paymentType === 'cash' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Nakit Miktarı"
                    keyboardType="numeric"
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholderTextColor="#aaa"
                  />
                )}
                {paymentType === 'card' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Kart Miktarı"
                    keyboardType="numeric"
                    value={cardAmount}
                    onChangeText={setCardAmount}
                    placeholderTextColor="#aaa"
                  />
                )}
                {paymentType === 'both' && (
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nakit Miktarı"
                      keyboardType="numeric"
                      value={cashAmount}
                      onChangeText={setCashAmount}
                      placeholderTextColor="#aaa"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Kart Miktarı"
                      keyboardType="numeric"
                      value={cardAmount}
                      onChangeText={setCardAmount}
                      placeholderTextColor="#aaa"
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handlePayment}
                >
                  <Text style={styles.submitButtonText}>Ödeme Yap</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: "#333",
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
    color: '#ff6600',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: "#444",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: '#555',
  },
  itemText: {
    color: '#fff',
  },
  totalContainer: {
    borderWidth: 2,
    borderColor: '#555',
    marginBottom: 3,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  totalText: {
    fontSize: 20,
    color: '#fff',
  },
  paymentButton: {
    backgroundColor: "#ff6600",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentButtonText: {
    color: "white",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    color: '#fff',
  },
  modalButton: {
    padding: 15,
    marginTop: 10,
    backgroundColor: "#444",
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#555',
  },
  modalButtonText: {
    color: '#fff',
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#555",
    marginTop: 10,
    borderRadius: 5,
    color: '#fff',
    backgroundColor: '#444',
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#444",
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
  },
});

export default Receipt;
