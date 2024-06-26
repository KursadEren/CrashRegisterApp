import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCameraDevices, Camera, useFrameProcessor } from 'react-native-vision-camera';
import { useBarcodeScanner } from '@mgcrea/vision-camera-barcode-scanner';
import { runOnJS } from 'react-native-reanimated';

const BarcodeCamera = ({ onBarcodeRead, onClose }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraDevice, setCameraDevice] = useState(null);
  const devices = useCameraDevices();
  const cameraRef = useRef(null);

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
      console.log('Camera permission:', permission);
    };
    requestPermission();
  }, []);

  useEffect(() => {
    if (devices && devices.back) {
      setCameraDevice(devices.back);
      console.log('Camera device set:', devices.back);
    } else {
      console.log('No camera devices found');
    }
  }, [devices]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const barcodes = useBarcodeScanner(frame, ['qr', 'ean-13']);
    if (barcodes.length > 0) {
      runOnJS(onBarcodeRead)(barcodes[0].displayValue);
    }
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!cameraDevice) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.cameraContainer}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={cameraDevice}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={'auto'}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BarcodeCamera;
