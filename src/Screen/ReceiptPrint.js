import React from 'react';
import { ScrollView, View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const ReceiptContent = ({ paymentDetails }) => (
  <View style={styles.receiptContainer}>
    <Text style={styles.title}>Fiş</Text>
    <Text style={styles.info}>Tarih: {paymentDetails.date}</Text>
    <View style={styles.tableContainer}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableHeader, { flex: 2 }]}>Ürün</Text>
        <Text style={styles.tableHeader}>Fiyat</Text>
        <Text style={styles.tableHeader}>Adet</Text>
        <Text style={styles.tableHeader}>Toplam</Text>
      </View>
      {paymentDetails.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableData, { flex: 2 }]}>{item.name}</Text>
          <Text style={styles.tableData}>{item.price.toFixed(2)}</Text>
          <Text style={styles.tableData}>{item.count}</Text>
          <Text style={styles.tableData}>{(item.price * item.count).toFixed(2)}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.info}>Ara Toplam: {paymentDetails.subtotal.toFixed(2)} TL</Text>
    <Text style={styles.info}>Toplam: {paymentDetails.total.toFixed(2)} TL</Text>
    <Text style={styles.info}>Ödeme Yöntemi: {paymentDetails.paymentType}</Text>
    <Text style={styles.info}>Nakit: {paymentDetails.cashAmount.toFixed(2)} TL</Text>
    <Text style={styles.info}>Kart: {paymentDetails.cardAmount.toFixed(2)} TL</Text>
    <Text style={styles.info}>Para Üstü: {paymentDetails.change.toFixed(2)} TL</Text>
  </View>
);

const ReceiptPrint = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentDetails } = route.params;

  const handlePrint = async () => {
    try {
      const currentDate = new Date();
      const reportNumber = "12345";
      const fileName = `Receipt_${reportNumber}_${currentDate.getTime()}.pdf`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receiptContainer { background-color: #fff; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
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
              <div class="title">Fiş</div>
              <div class="info">Tarih: ${paymentDetails.date}</div>
              <div class="tableContainer">
                <div class="tableRow">
                  <div class="tableHeader" style="flex: 2;">Ürün</div>
                  <div class="tableHeader">Fiyat</div>
                  <div class="tableHeader">Adet</div>
                  <div class="tableHeader">Toplam</div>
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
              <div class="info">Ara Toplam: ${paymentDetails.subtotal.toFixed(2)} TL</div>
              <div class="info">Toplam: ${paymentDetails.total.toFixed(2)} TL</div>
              <div class="info">Ödeme Yöntemi: ${paymentDetails.paymentType}</div>
              <div class="info">Nakit: ${paymentDetails.cashAmount.toFixed(2)} TL</div>
              <div class="info">Kart: ${paymentDetails.cardAmount.toFixed(2)} TL</div>
              <div class="info">Para Üstü: ${paymentDetails.change.toFixed(2)} TL</div>
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
      Alert.alert('Başarılı', `PDF dosyası başarıyla kaydedildi!\n\nDosya Yolu: ${file.filePath}`, [{ text: 'Tamam' }]);
    } catch (error) {
      console.error('Yazdırma başarısız oldu: ', error);
      Alert.alert('Hata', 'PDF dosyası kaydedilemedi.', [{ text: 'Tamam' }]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ReceiptContent paymentDetails={paymentDetails} />
      <Button title="Yazdır" onPress={handlePrint} />
      <Button title="Ana Sayfa" onPress={() => navigation.navigate('Home')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  receiptContainer: {
    backgroundColor: '#fff',
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
});

export default ReceiptPrint;
