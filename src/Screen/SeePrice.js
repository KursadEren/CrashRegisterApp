import {
  CameraHighlights,
  useBarcodeScanner,
} from "@mgcrea/vision-camera-barcode-scanner";
import { useCameraDevices,useCameraFormat,Camera } from "react-native-vision-camera";
import { StyleSheet,View } from "react-native";

  const App = () => {
  // @NOTE you must properly ask for camera permissions first!
  // You should use `PermissionsAndroid` for Android and `Camera.requestCameraPermission()` on iOS.

  const { props: cameraProps, highlights } = useBarcodeScanner({
    fps: 5,
    barcodeTypes: ["qr", "ean-13"], // optional
    onBarcodeScanned: (barcodes) => {
      "worklet";
      console.log(
        `Scanned ${barcodes.length} codes with values=${JSON.stringify(
          barcodes.map(({ value }) => value),
        )} !`,
      );
    },
  });

  const devices = useCameraDevices();
  const device = devices.find(({ position }) => position === "back");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
  ]);
  if (!device) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        {...cameraProps}
      />
      <CameraHighlights highlights={highlights} color="peachpuff" />
    </View>
  );
};
export default App;