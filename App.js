import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import axios from "axios";
import "expo-dev-client";

const App = () => {
	const [hasPermission, setHasPermission] = useState(null);
	const [qrData1, setQrData1] = useState(null);
	const [qrData2, setQrData2] = useState(null);
	const [captureMode, setCaptureMode] = useState(null);
	const [showSubmitButton, setShowSubmitButton] = useState(false);

	useEffect(() => {
		console.log("Component rerendered. Capture mode:", captureMode);
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	const formatAndShowPreview = (data) => {
		let previewString = "Data Preview:\n";
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				previewString += `${key}: ${JSON.stringify(data[key])}\n`;
			}
		}
		Alert.alert("QR Code Preview", previewString);
	};

	const handleBarCodeScanned = ({ data }) => {
		//console.log("Scanned data:", data);
		try {
			const qrCodeData = JSON.parse(data);
			//console.log("Parsed QR code data:", qrCodeData);
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
			console.error("Error parsing QR code data:", error);
		}
	};

	const handleScan = (mode) => {
		console.log("Scanning mode:", mode);
		setCaptureMode(mode);
		setShowSubmitButton(true);
	};

	const serverEndpoint = "https://elevini.com/gmdc/app2";

	// uncomment to restore the function
	const handleSubmit = () => {
		if (qrData1 && qrData2) {
			const combinedData = {
				qrData: {
					"Scan 1": { data: qrData1.data },
					"Scan 2": { data: qrData2.data },
				},
			};

			axios
				.post(`${serverEndpoint}/store-data.php`, combinedData)
				.then((response) => {
					console.log("Data sent successfully:", response.data);
					Alert.alert("Success", "Data submitted successfully");
				})
				.catch((error) => {
					console.error("Error sending data:", error.message);
				});

			console.log("Captured QR Data - Scan 1:", {
				data: qrData1.data,
				formattedTimestamp: new Date(qrData1.data.timestamp).toLocaleString(),
			});

			console.log("Captured QR Data - Scan 2:", {
				data: qrData2.data,
				formattedTimestamp: new Date(qrData2.data.timestamp).toLocaleString(),
			});

			setQrData1(null);
			setQrData2(null);
			setShowSubmitButton(false);
		} else {
			Alert.alert("Please complete both scans before submitting.");
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
				onBarCodeScanned={handleBarCodeScanned}
				ratio="1:1"
			/>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.buttons, { backgroundColor: "#F5821F" }]}
					onPress={() => handleScan(1)}
				>
					<Text style={styles.buttonText}>Scan Vehicle</Text>
				</TouchableOpacity>
				{showSubmitButton && (
					<TouchableOpacity
						style={[styles.buttons, { backgroundColor: "green" }]}
						onPress={() => handleSubmit()}
					>
						<Text style={styles.buttonText}>Submit</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity
					style={[styles.buttons, { backgroundColor: "#F5821F" }]}
					onPress={() => handleScan(2)}
				>
					<Text style={styles.buttonText}>Scan Location</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#0f172a",
		width: "100%",
	},
	camera: {
		flex: 1,
		aspectRatio: 1,
	},
	buttonContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-around",
		paddingTop: 20,
		paddingBottom: 20,
		width: "95%",
		gap: 20,
		// alignItems: "space-between",
		// alignContent: "space-between",
		// flexWrap: "wrap",
		// justifyItems: "space-between",
		// marginTop: 20,
		// marginBottom: 20,
		// paddingLeft: 15,
		// paddingRight: 15,
	},
	buttons: {
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		fontSize: 12,
		color: "#ffffff", // Set the text color for the buttons
	},
});

export default App;
