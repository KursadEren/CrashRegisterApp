import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const { width } = Dimensions.get('window');

const SwipeScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const translateX = new Animated.Value(0);
  const translateXOffset = new Animated.Value(0);
  const gestureHandler = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = nativeEvent;
      const isSwipingLeft = translationX < -width / 3;
      const isSwipingRight = translationX > width / 3;

      if (isSwipingLeft) {
        Animated.timing(translateX, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsLogin(false);
          translateX.setValue(0);
          translateXOffset.setValue(0);
        });
      } else if (isSwipingRight) {
        Animated.timing(translateX, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsLogin(true);
          translateX.setValue(0);
          translateXOffset.setValue(0);
        });
      } else {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          translateXOffset.setValue(0);
        });
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateX: Animated.add(translateX, translateXOffset) }],
            },
          ]}
        >
          <LoginScreen />
        </Animated.View>
        <Animated.View
          style={[
            styles.container,
            {
              position: 'absolute',
              left: width,
              transform: [{ translateX: Animated.add(translateX, translateXOffset).interpolate({
                inputRange: [-width, 0, width],
                outputRange: [0, width, 2 * width],
              }) }],
            },
          ]}
        >
          <RegisterScreen />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    width,
  },
});

export default SwipeScreen;
