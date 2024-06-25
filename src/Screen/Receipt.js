import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Vibration, BackHandler, useWindowDimensions, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import MyTextInput from '../Component/MyTextınput';
import axios from 'axios';

const Receipt = ({ route }) => {
  const { data2List, bagCount, bagCost } = route.params;
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [change, setChange] = useState(0);
  const [campaignDiscount, setCampaignDiscount] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const navigation = useNavigation();
  const { serviceStatus } = useServiceStatus();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const storedCampaigns = await AsyncStorage.getItem('@campaigns');
        if (storedCampaigns) {
          setCampaigns(JSON.parse(storedCampaigns).campaigns);
        } else {
          const response = await axios.get('http://localhost:3003/campaigns');
          const campaignsData = response.data;
          await AsyncStorage.setItem('@campaigns', JSON.stringify(campaignsData));
          setCampaigns(campaignsData.campaigns);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        Vibration.vibrate();
      }
    };

    const fetchSellerName = async () => {
      const name = await AsyncStorage.getItem('@seller_name');
      setSellerName(name || '');
    };

    fetchCampaigns();
    fetchSellerName();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalItems = 0;

    data2List.forEach(item => {
      subtotal += item.price * item.count;
      totalItems += item.count;
    });

    let discount = 0;
    if (selectedCampaign === 1) {
      data2List.forEach(item => {
        const discountCount = Math.floor(item.count / 3);
        discount += discountCount * item.price;
      });
    } else if (selectedCampaign === 2) {
      data2List.forEach(item => {
        if (item.count >= 5) {
          discount += item.price * 0.2 * item.count;
        }
      });
    }

    return {
      subtotal,
      total: subtotal - discount + bagCost,
      totalItems,
      discount,
    };
  };

  const { subtotal, total, totalItems, discount } = calculateTotals();

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
        bagCount: bagCount,
        bagCost: bagCost,
        campaignDiscount: discount,
        saleDate: currentDate.toLocaleString('tr-TR', options),
        centralSendTime: serviceStatus ? currentDate.toLocaleString('tr-TR', options) : null,
        sentToCentral: serviceStatus,
        pdfPath: null,
        sellerName: sellerName,
        buyerName: buyerName
      };

      try {
        await AsyncStorage.setItem('@payment_' + currentDate.getTime(), JSON.stringify(paymentDetails));
        if (!serviceStatus) {
          await AsyncStorage.setItem('@pendingPayment_' + currentDate.getTime(), JSON.stringify(paymentDetails));
        }
      } catch (e) {
        console.log('Error saving payment details:', e);
      }

      setModalVisible(false);
      navigation.navigate('ReceiptPrint', { paymentDetails });
    } else {
      alert(t('error_paid_less_than_total'));
      Vibration.vibrate();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.campaignButtonContainer}>
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <TouchableOpacity
              key={campaign.id}
              style={[
                styles.campaignButton,
                { backgroundColor: theme.primaryColor },
                selectedCampaign === campaign.id && styles.selectedCampaignButton
              ]}
              onPress={() => {
                setSelectedCampaign(campaign.id);
                if (campaign.id === 1) {
                  setCampaignDiscount(calculateTotals().discount);
                } else if (campaign.id === 2) {
                  setCampaignDiscount(calculateTotals().discount);
                }
              }}
            >
              <Text style={styles.campaignButtonText}>{campaign.name} - {campaign.discount}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noCampaignText, { color: theme.textColor }]}>{t('no_campaigns')}</Text>
        )}
      </View>

      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flex: 2 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>{t('product')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>{t('price')}</Text>
        </View>
        <View style={{ flex: 0.5 }}>
          <Text style={[styles.headerText, { color: theme.primaryColor }]}>{t('count')}</Text>
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
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('subtotal')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('total_campaign_discount')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{discount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('total_bag_cost')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{bagCost.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('total')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('total_items')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{totalItems}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{t('change')}:</Text>
          <Text style={[styles.totalText, isLandscape && styles.totalTextLandscape, { color: theme.textColor }]}>{change.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentButton, { backgroundColor: theme.primaryColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.paymentButtonText}>{t('make_payment')}</Text>
      </TouchableOpacity>

      <Button title="Help" onPress={() => setShowHelp(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>{t('select_payment_method')}</Text>
            
            <Text style={[styles.label, { color: theme.textColor }]}>{t('buyer_name')}</Text>
            <MyTextInput
              style={[styles.input, styles.buyerNameInput, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
              placeholder={t('enter_buyer_name')}
              label1=""
              value={buyerName}
              onChangeText={setBuyerName}
              placeholderTextColor={theme.placeholderTextColor}
            />

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'cash' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
              onPress={() => setPaymentType('cash')}
            >
              <Text style={[styles.modalButtonText, { color: theme.textColor }]}>{t('cash')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'card' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
              onPress={() => setPaymentType('card')}
            >
              <Text style={[styles.modalButtonText, { color: theme.textColor }]}>{t('card')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, paymentType === 'both' && styles.selectedButton, { backgroundColor: theme.buttonBackground }]}
              onPress={() => setPaymentType('both')}
            >
              <Text style={[styles.modalButtonText, { color: theme.textColor }]}>{t('both')}</Text>
            </TouchableOpacity>

            {paymentType !== '' && (
              <View style={styles.inputContainer}>
                {paymentType === 'cash' && (
                  <MyTextInput
                    style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                    placeholder={t('cash_amount')}
                    keyboardType="numeric"
                    label1={""}
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholderTextColor={theme.placeholderTextColor}
                  />
                )}
                {paymentType === 'card' && (
                  <MyTextInput
                    style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                    placeholder={t('card_amount')}
                    keyboardType="numeric"
                    label1={""}
                    value={cardAmount}
                    onChangeText={setCardAmount}
                    placeholderTextColor={theme.placeholderTextColor}
                  />
                )}
                {paymentType === 'both' && (
                  <View>
                    <MyTextInput
                      style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                      placeholder={t('cash_amount')}
                      keyboardType="numeric"
                      label1={""}
                      value={cashAmount}
                      onChangeText={setCashAmount}
                      placeholderTextColor={theme.placeholderTextColor}
                    />
                    <MyTextInput
                      style={[styles.input, { borderColor: theme.inputBorder, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                      label1={""}
                      placeholder={t('card_amount')}
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
                  <Text style={[styles.submitButtonText, { color: theme.textColor }]}>{t('make_payment')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showHelp}
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.helpOverlay}>
          <View style={[styles.helpContent, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.helpTitle, { color: theme.textColor }]}>{t('help')}</Text>
            <Text style={[styles.helpText, { color: theme.textColor }]}>
              {t('help_text')}
            </Text>
            <Button title="Close" onPress={() => setShowHelp(false)} />
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
  campaignButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  campaignButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  selectedCampaignButton: {
    borderWidth: 2,
    borderColor: 'gold',
  },
  campaignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noCampaignText: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButton: {
    padding: 15,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  selectedButton: {
    borderColor: 'gold',
    borderWidth: 2,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 20,
    width: '100%',
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
  },
  buyerNameInput: {
    fontSize: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  helpContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  helpTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default Receipt;
