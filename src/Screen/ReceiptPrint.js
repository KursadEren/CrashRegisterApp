import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

const ReceiptPrint = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentDetails } = route.params;

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .container {
              margin: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info {
              margin-bottom: 10px;
            }
            .tableContainer {
              margin-bottom: 20px;
              border-collapse: collapse;
              width: 100%;
            }
            .tableRow {
              border-bottom: 1px solid #000;
              padding: 8px 0;
            }
            .tableHeader {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">Fiş</h1>
            <div class="info">
              <p><strong>Tarih:</strong> ${paymentDetails.date}</p>
              <table class="tableContainer">
                <tr class="tableRow">
                  <th class="tableHeader">Ürün</th>
                  <th class="tableHeader">Fiyat</th>
                  <th class="tableHeader">Adet</th>
                </tr>
                ${paymentDetails.items.map(item => `
                  <tr class="tableRow">
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td>${item.count}</td>
                  </tr>
                `).join('')}
              </table>
              <p><strong>Ara Toplam:</strong> ${paymentDetails.subtotal.toFixed(2)}</p>
              <p><strong>Toplam:</strong> ${paymentDetails.total.toFixed(2)}</p>
              <p><strong>Ödeme Yöntemi:</strong> ${paymentDetails.paymentType}</p>
              <p><strong>Nakit:</strong> ${paymentDetails.cashAmount.toFixed(2)}</p>
              <p><strong>Kart:</strong> ${paymentDetails.cardAmount.toFixed(2)}</p>
              <p><strong>Para Üstü:</strong> ${paymentDetails.change.toFixed(2)}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const currentDate = new Date();
      const reportNumber = "12345"; // Rapor numarası
      const fileName = `Receipt_${reportNumber}_${currentDate.getTime()}.pdf`; // Yeni dosya adı
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Eğer varsa dosyayı sil
      try {
        await RNFS.unlink(destPath);
      } catch (error) {
        console.log("Dosya bulunamadı veya silinemedi.");
      }

      // HTML içeriğinden PDF oluştur
      const { filePath } = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'Receipt',
        base64: true,
      });
      
      // PDF dosyasını belgeler dizinine taşı
      await RNFS.moveFile(filePath, destPath);
      
      console.log('Dosya kaydedildi: ', destPath);
      Alert.alert('Başarılı', `PDF dosyası başarıyla kaydedildi!\n\nDosya Yolu: ${destPath}`, [{ text: 'Tamam' }]);
    } catch (error) {
      console.error('Yazdırma başarısız oldu: ', error);
      Alert.alert('Hata', 'PDF dosyası kaydedilemedi.', [{ text: 'Tamam' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fiş</Text>
      <Text style={styles.info}>Tarih: {paymentDetails.date}</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Ürün</Text>
          <Text style={styles.tableHeader}>Fiyat</Text>
          <Text style={styles.tableHeader}>Adet</Text>
        </View>
        {paymentDetails.items.map((item, index) => (
          <View key={index} style
          ={styles.tableRow}>
          <Text style={[styles.tableData, { flex: 2 }]}>{item.name}</Text>
          <Text style={styles.tableData}>{item.price}</Text>
          <Text style={styles.tableData}>{item.count}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.info}>Ara Toplam: {paymentDetails.subtotal.toFixed(2)}</Text>
    <Text style={styles.info}>Toplam: {paymentDetails.total.toFixed(2)}</Text>
    <Text style={styles.info}>Ödeme Yöntemi: {paymentDetails.paymentType}</Text>
    <Text style={styles.info}>Nakit: {paymentDetails.cashAmount.toFixed(2)}</Text>
    <Text style={styles.info}>Kart: {paymentDetails.cardAmount.toFixed(2)}</Text>
    <Text style={styles.info}>Para Üstü: {paymentDetails.change.toFixed(2)}</Text>
    <Button title="Yazdır" onPress={handlePrint} />
    <Button title="Ana Sayfa" onPress={() => navigation.navigate('Home')} />
  </View>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
},
info: {
  marginBottom: 10,
},
tableContainer: {
  marginBottom: 20,
},
tableRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderColor: 'black',
  paddingVertical: 5,
},
tableHeader: {
  fontWeight: 'bold',
},
tableData: {
  flex: 1,
},
});

export default ReceiptPrint;
