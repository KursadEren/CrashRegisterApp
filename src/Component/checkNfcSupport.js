const checkNfcSupport = async () => {
    try {
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        throw new Error('NFC is not supported');
      }
  
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert('NFC Error', 'NFC is disabled');
      }
    } catch (error) {
      Alert.alert('NFC Error', error.message);
    }
  };
  