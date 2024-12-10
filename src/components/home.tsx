import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios"; 

export default function home() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null); // Armazena o e-mail lido
  const qrCodeLock = useRef(false);

  // Função que abre a câmera
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

  // Função chamada quando o QR Code é lido
  function handleQRCodeRead(data: string) {
    setEmail(data); // Armazena o e-mail lido do QR Code
    setModalIsVisible(false); // Fecha a câmera
  }

  // Função para enviar o e-mail
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
      <Text style={styles.subtitle}>Posicione o QR Code dentro da área abaixo</Text>

      <TouchableOpacity style={styles.startButton} onPress={handleOpenCamera}>
        <Text style={styles.startButtonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      {/* Modal de Câmera */}
      <Modal visible={modalIsVisible} transparent={true}>
        <View style={styles.overlay}>
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

          {/* Botão de fechar no canto superior direito */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalIsVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Mostrar botão para enviar e-mail após QR Code ser lido */}
      {email && (
        <View style={styles.emailContainer}>
          <Text style={styles.emailText}>E-mail detectado: {email}</Text>
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
            <Text style={styles.sendButtonText}>Enviar E-mail</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    marginBottom: 40,
    textAlign: "center",
  },
  startButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#4CAF50", 
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#333", 
    padding: 10,
    borderRadius: 50,
    opacity: 0.7,
    zIndex: 10,
  },
  emailContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  emailText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  sendButton: {
    padding: 15,
    backgroundColor: "#007BFF", 
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
