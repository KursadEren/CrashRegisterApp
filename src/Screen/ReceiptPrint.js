import React, { useState, useContext } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import MyButton from '../Component/MyButton';
import { useWindowDimensions } from 'react-native';
import { ThemeContext } from '../Context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const ReceiptContent = ({ paymentDetails }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <View style={[styles.receiptContainer, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{t('receipt')}</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('date')}: {paymentDetails.date}</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { color: theme.textColor, flex: 2 }]}>{t('product')}</Text>
          <Text style={[styles.tableHeader, { color: theme.textColor }]}>{t('price')}</Text>
          <Text style={[styles.tableHeader, { color: theme.textColor }]}>{t('count')}</Text>
          <Text style={[styles.tableHeader, { color: theme.textColor }]}>{t('total')}</Text>
        </View>
        {paymentDetails.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableData, { color: theme.textColor, flex: 2 }]}>{item.name}</Text>
            <Text style={[styles.tableData, { color: theme.textColor }]}>{item.price.toFixed(2)}</Text>
            <Text style={[styles.tableData, { color: theme.textColor }]}>{item.count}</Text>
            <Text style={[styles.tableData, { color: theme.textColor }]}>{(item.price * item.count).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('subtotal')}: {paymentDetails.subtotal.toFixed(2)} TL</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('total')}: {paymentDetails.total.toFixed(2)} TL</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('payment_method')}: {paymentDetails.paymentType}</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('cash')}: {paymentDetails.cashAmount.toFixed(2)} TL</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('card')}: {paymentDetails.cardAmount.toFixed(2)} TL</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('change')}: {paymentDetails.change.toFixed(2)} TL</Text>
    </View>
  );
};

const ReceiptPrint = () => {
  const { theme } = useContext(ThemeContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentDetails } = route.params;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { t } = useTranslation();

  const handlePrint = async () => {
    try {
      const currentDate = new Date();
      const reportNumber = "12345";
      const fileName = `Receipt_${reportNumber}_${currentDate.getTime()}`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background-color: ${theme.backgroundColor}; color: ${theme.textColor}; }
              .receiptContainer { background-color: ${theme.backgroundColor}; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
              .info { margin-bottom: 10px; font-size: 16px; }
              .tableContainer { margin-bottom: 20px; width: 100%; border-collapse: collapse; }
              .tableRow { display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 10px 0; }
              .tableHeader { font-weight: bold; text-align: center; flex: 1; }
              .tableData { text-align: center; flex: 1; }
            </style>
          </head>
          <body>
            <div class="receiptContainer">
              <div class="title">${t('receipt')}</div>
              <div class="info">${t('date')}: ${paymentDetails.date}</div>
              <div class="tableContainer">
                <div class="tableRow">
                  <div class="tableHeader" style="flex: 2;">${t('product')}</div>
                  <div class="tableHeader">${t('price')}</div>
                  <div class="tableHeader">${t('count')}</div>
                  <div class="tableHeader">${t('total')}</div>
                </div>
                ${paymentDetails.items.map((item) => `
                  <div class="tableRow">
                    <div class="tableData" style="flex: 2;">${item.name}</div>
                    <div class="tableData">${item.price.toFixed(2)}</div>
                    <div class="tableData">${item.count}</div>
                    <div class="tableData">${(item.price * item.count).toFixed(2)}</div>
                  </div>
                `).join('')}
              </div>
              <div class="info">${t('subtotal')}: ${paymentDetails.subtotal.toFixed(2)} TL</div>
              <div class="info">${t('total')}: ${paymentDetails.total.toFixed(2)} TL</div>
              <div class="info">${t('payment_method')}: ${paymentDetails.paymentType}</div>
              <div class="info">${t('cash')}: ${paymentDetails.cashAmount.toFixed(2)} TL</div>
              <div class="info">${t('card')}: ${paymentDetails.cardAmount.toFixed(2)} TL</div>
              <div class="info">${t('change')}: ${paymentDetails.change.toFixed(2)} TL</div>
            </div>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('Dosya kaydedildi: ', file.filePath);

      // PDF dosyasının yolunu paymentDetails'e ekleyin
      paymentDetails.pdfPath = file.filePath;

      // AsyncStorage'daki ödeme kaydını güncelleyin
      const paymentKey = '@payment_' + new Date(paymentDetails.saleDate).getTime();
      await AsyncStorage.setItem(paymentKey, JSON.stringify(paymentDetails));

      Alert.alert(t('success'), `${t('pdf_saved_success')}\n\n${t('file_path')}: ${file.filePath}`, [{ text: t('ok') }]);
      navigation.navigate("Home");
    } catch (error) {
      console.error('Yazdırma başarısız oldu: ', error);
      Alert.alert(t('error'), t('pdf_save_failed'), [{ text: t('ok') }]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ReceiptContent paymentDetails={paymentDetails} />
      <View style={styles.buttonContainer}>
        <MyButton visible={true} iconname="printer-pos" OnChangeButton={handlePrint} text={t('print')} />
        <MyButton visible={true} OnChangeButton={() => navigation.navigate('Home')} text={t('home_page')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  receiptContainer: {
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    marginBottom: 10,
    fontSize: 16,
  },
  tableContainer: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  tableData: {
    textAlign: 'center',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
});

export default ReceiptPrint;
