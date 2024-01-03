import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [qrData1, setQrData1] = useState(null);
  const [qrData2, setQrData2] = useState(null);
  const [captureMode, setCaptureMode] = useState(null);
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const formatAndShowPreview = (data) => {
    let previewString = 'Data Preview:\n';
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        previewString += `${key}: ${JSON.stringify(data[key])}\n`;
      }
    }
    Alert.alert('QR Code Preview', previewString);
  };

  const handleBarCodeScanned = ({ data }) => {
    try {
      const qrCodeData = JSON.parse(data);
      const timestamp = new Date().toISOString();

      if (captureMode === 1) {
        setQrData1({ data: { ...qrCodeData, timestamp } });
        setCaptureMode(null);
        setShowSubmitButton(true);
        formatAndShowPreview({ ...qrCodeData, timestamp });
      } else if (captureMode === 2) {
        setQrData2({ data: { ...qrCodeData, timestamp } });
        setCaptureMode(null);
        setShowSubmitButton(true);
        formatAndShowPreview({ ...qrCodeData, timestamp });
      }
    } catch (error) {
      console.error('Error parsing QR code data:', error);
    }
  };

  const handleScan = (mode) => {
    setCaptureMode(mode);
    setShowSubmitButton(false);
  };

  const serverEndpoint = 'https://elevini.com/gmdc/app';

  const handleSubmit = () => {
    if (qrData1 && qrData2) {
      const combinedData = {
        'Scan 1': { data: qrData1.data },
        'Scan 2': { data: qrData2.data },
      };

      const jsonData = JSON.stringify(combinedData);

      axios.post(`${serverEndpoint}/store-data.php`, { qrData: jsonData })
        .then(response => {
          console.log('Data sent successfully:', response.data);
          Alert.alert('Success', 'Data submitted successfully');
        })
        .catch(error => {
          console.error('Error sending data:', error.message);
        });

      console.log('Captured QR Data - Scan 1:', {
        data: qrData1.data,
        formattedTimestamp: new Date(qrData1.data.timestamp).toLocaleString(),
      });

      console.log('Captured QR Data - Scan 2:', {
        data: qrData2.data,
        formattedTimestamp: new Date(qrData2.data.timestamp).toLocaleString(),
      });

      setQrData1(null);
      setQrData2(null);
      setShowSubmitButton(false);
    } else {
      console.warn('Please complete both scans before submitting.');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={captureMode ? handleBarCodeScanned : undefined}
        ratio="1:1"
      />
      <View style={styles.buttonContainer}>
        <Button title="Scan Vehicle" onPress={() => handleScan(1)} />
        {showSubmitButton && <Button title="Submit" onPress={() => handleSubmit()} />}
        <Button title="Scan Location" onPress={() => handleScan(2)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#273C75'
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
});

export default App;
