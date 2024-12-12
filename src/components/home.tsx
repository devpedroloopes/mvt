import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Home() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const qrCodeLock = useRef(false);

  const API_URL = 'https://mvt-al9m.onrender.com';

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

    const lines = data.split(/\r?\n/);
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

    const possibleEmail = lines[0]?.trim();
    const possibleSubject = lines[1]?.trim();
    const possibleLocation = lines[2]?.trim();

    if (!emailRegex.test(possibleEmail)) {
      Alert.alert('Erro', 'Código QR inválido, não contém um e-mail válido na primeira linha.');
      return;
    }

    qrCodeLock.current = true;
    setEmail(possibleEmail);
    setSubject(possibleSubject || 'Sem assunto');
    setLocation(possibleLocation || 'Local não especificado');
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email || !subject || !location) {
      return Alert.alert('Erro', 'Dados incompletos. Escaneie o QR Code novamente.');
    }

    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);

    try {
      const response = await axios.post(`${API_URL}`, { email, subject, location });

      if (!response.data.success) {
        Alert.alert('Erro', response.data.message || 'Falha ao enviar o e-mail');
      } else {
        Alert.alert('Sucesso', 'E-mail enviado com sucesso!');
        setEmail(null);
        setSubject(null);
        setLocation(null);
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

      <TouchableOpacity style={styles.button} onPress={handleOpenCamera}>
        <Text style={styles.buttonText}>Iniciar Leitura</Text>
      </TouchableOpacity>

      {email && subject && location && (
        <>
          <Text style={styles.infoText}>E-mail: {email}</Text>
          <Text style={styles.infoText}>Assunto: {subject}</Text>
          <Text style={styles.infoText}>Local: {location}</Text>
          <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
            <Text style={styles.buttonText}>Enviar E-mail</Text>
          </TouchableOpacity>
        </>
      )}

      {emailSent && <Text style={styles.successMessage}>E-mail enviado!</Text>}

      <Modal visible={modalIsVisible} transparent={true}>
        <View style={styles.overlay}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={({ data }) => {
              if (data) handleQRCodeRead(data);
            }}
          />
          <View style={styles.focusBox} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalIsVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
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
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#0078D7',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#28A745',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
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
    position: 'absolute',
  },
  focusBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#00FF00',
    borderRadius: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 50,
  },
  successMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
});
