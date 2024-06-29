import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Vibration, Text } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLandscape } from '../Context/LandSpaceProvider';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function MyButton({ OnChangeButton, iconname, text, visible, hasError, badge }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isLandscape = useLandscape();

  const onPress = async () => {
    setLoading(true);
    await OnChangeButton();
    setLoading(false);
  };

  useEffect(() => {
    if (hasError) {
      Vibration.vibrate();
    }
  }, [hasError]);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.buttonContainer, isLandscape ? styles.buttonContainerLandscape : styles.buttonContainerPortrait]}>
      <Button
        mode="contained"
        onPress={onPress}
        style={[styles.button, { backgroundColor: theme.primaryColor }]}
        labelStyle={styles.buttonText}
        disabled={loading}
        icon={() => (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={iconname}
              size={24}
              color="#fff"
            />
            {badge > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
        )}
      >
        {loading ? <ActivityIndicator color="#fff" /> : t(text)}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {},
  buttonContainerPortrait: {
    width: '100%',
  },
  buttonContainerLandscape: {
    width: '100%',
  },
  button: {
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 5,
    marginLeft: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
});
