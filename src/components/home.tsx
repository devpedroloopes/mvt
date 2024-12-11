import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Home() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const qrCodeLock = useRef(false);

  const API_URL = 'https://mvt-al9m.onrender.com'; // Substitua pelo domínio/URL de produção, se necessário

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert('Câmera', 'Você precisa habilitar o uso da câmera');
      }
      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.error(error);
    }
  }

  function handleQRCodeRead(data: string) {
    if (qrCodeLock.current) return;

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(data)) {
      Alert.alert('Erro', 'Código QR inválido, não é um e-mail.');
      return;
    }

    qrCodeLock.current = true;
    setEmail(data);
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email) {
      return Alert.alert('Erro', 'Nenhum e-mail detectado');
    }

    try {
      const response = await axios.post(`${API_URL}`, { email });

      if (response.data.success) {
        Alert.alert('Sucesso', 'E-mail enviado com sucesso!');
      } else {
        Alert.alert('Erro', response.data.message || 'Falha ao enviar o e-mail');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao enviar o e-mail:', error.message);
        Alert.alert('Erro', 'Erro ao comunicar com o servidor: ' + error.message);
      } else {
        console.error('Erro desconhecido:', error);
        Alert.alert('Erro', 'Erro desconhecido ao comunicar com o servidor.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escaneie o QR Code</Text>
      <Text style={styles.subtitle}>Posicione o QR Code dentro da área abaixo</Text>

      <TouchableOpacity style={styles.startButton} onPress={handleOpenCamera}>
        <Text style={styles.startButtonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      <Modal visible={modalIsVisible} transparent={true}>
        <View style={styles.overlay}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={({ data }) => {
              if (data) handleQRCodeRead(data);
            }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalIsVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  startButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#0078D7',
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 50,
  },
  emailContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    width: '90%',
  },
  emailText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
  },
  sendButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#28A745',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
