import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Receipt = ({ route }) => {
  const { data2List } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [change, setChange] = useState(0);
  const navigation = useNavigation();

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
    let totalPaid = parseFloat(cashAmount || 0) + parseFloat(cardAmount || 0);
    if (totalPaid >= total) {
      setChange(totalPaid - total);
      const paymentDetails = {
        date: new Date().toISOString(),
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
          <Text>Product</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Price</Text>
        </View>
        <View style={{ flex: 0.5 }}>
          <Text>Count</Text>
        </View>
      </View>

      <FlatList
        data={data2List}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 2 }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text>{item.price}</Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Text>x{item.count}</Text>
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
              style={styles.modalButton}
              onPress={() => setPaymentType('cash')}
            >
              <Text>Nakit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPaymentType('card')}
            >
              <Text>Kart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPaymentType('both')}
            >
              <Text>Hem Kart Hem Nakit</Text>
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
                  />
                )}
                {paymentType === 'card' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Kart Miktarı"
                    keyboardType="numeric"
                    value={cardAmount}
                    onChangeText={setCardAmount}
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
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Kart Miktarı"
                      keyboardType="numeric"
                      value={cardAmount}
                      onChangeText={setCardAmount}
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
  },
  header: {
    backgroundColor: "white",
    marginTop: 3,
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  item: {
    backgroundColor: "white",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.4,
  },
  totalContainer: {
    borderWidth: 2,
    borderStyle: "solid",
    marginBottom: 3,
    padding: 10,
  },
  totalText: {
    fontSize: 20,
  },
  paymentButton: {
    backgroundColor: "blue",
    padding: 15,
    alignItems: "center",
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
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  modalButton: {
    padding: 15,
    marginTop: 10,
    backgroundColor: "lightgrey",
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "grey",
    marginTop: 10,
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "green",
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
  },
});

export default Receipt;
