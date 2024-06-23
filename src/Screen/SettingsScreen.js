import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MyButton from '../Component/MyButton';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'tr' : 'en');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.textColor }]}>SettingsScreen</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="Settings" OnChangeButton={() => {}} text="Ingenico Ayarları" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="settings" OnChangeButton={() => {}} text="Diğer Ayarlar" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="download" OnChangeButton={() => {}} text="Tüm Satışları Aktar" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="print" OnChangeButton={() => {}} text="Yazıcı Testi" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="download" OnChangeButton={() => {}} text="Konfigürasyonu Yeniden Yükle" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="settings" OnChangeButton={() => {}} text="Operasyonlar" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="download" OnChangeButton={() => {}} text="Terazi Ayarları" />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="translate" OnChangeButton={handleLanguageChange} text={t('change_language')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="theme-light-dark" OnChangeButton={toggleTheme} text={t('change_theme')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    marginBottom: 10,
    width: '100%',
  },
});

export default SettingsScreen;
