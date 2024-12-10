import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");
const scanAreaSize = width * 0.7;

export default function Home() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const qrCodeLock = useRef(false);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert("Câmera", "Você precisa habilitar o uso da câmera");
      }
      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.log(error);
    }
  }

  function handleQRCodeRead(data: string) {
    setEmail(data);
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email) return;

    try {
      const response = await axios.post('http://192.168.0.234:3000/send-email', { email });
      if (response.data.success) {
        Alert.alert("Sucesso", "E-mail enviado com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao enviar o e-mail");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao comunicar com o servidor");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escaneie o QR Code</Text>
      <Text style={styles.subtitle}>Aponte a câmera para o QR Code</Text>

      <TouchableOpacity style={styles.startButton} onPress={handleOpenCamera}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
        <Text style={styles.startButtonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      <Modal visible={modalIsVisible} transparent={true}>
        <View style={styles.overlay}>
          <Text style={styles.scanText}>Posicione o QR Code dentro do marcador</Text>
          <View style={styles.scanContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={({ data }) => {
                if (data && !qrCodeLock.current) {
                  qrCodeLock.current = true;
                  setTimeout(() => handleQRCodeRead(data), 500);
                }
              }}
            />
            <View style={styles.scanFrame}>
              <View style={styles.scanMarker} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalIsVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {email && (
        <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
          <Text style={styles.sendButtonText}>Enviar E-mail</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    padding: 15,
    backgroundColor: "#0078D7",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  startButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  scanText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  scanContainer: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  scanFrame: {
    width: scanAreaSize,
    height: scanAreaSize,
    justifyContent: "center",
    alignItems: "center",
  },
  scanMarker: {
    width: scanAreaSize,
    height: scanAreaSize,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#00FF88",
    opacity: 0.8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 50,
  },
  sendButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#28A745",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  sendButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
