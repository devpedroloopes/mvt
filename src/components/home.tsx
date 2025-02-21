import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Home({ route }: any) {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [email, setEmail] = useState<string[] | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const qrCodeLock = useRef(false);

  const { username } = route.params; // Pega o username enviado pela tela de login

  const API_URL = 'https://mvt-al9m.onrender.com';

  useEffect(() => {
    if (username) {
      console.log('Usuário logado:', username);
    }
  }, [username]);

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

    const possibleEmails = lines[0]?.trim();
    const possibleClientName = lines[1]?.trim();
    const possibleLocation = lines[2]?.trim();

    if (!possibleEmails) {
      Alert.alert('Erro', 'Código QR inválido, não contém e-mails.');
      return;
    }

    // Separar e-mails e validar
    const emails = possibleEmails.split(';').map((email) => email.trim());
    const invalidEmails = emails.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      Alert.alert('Erro', `Os seguintes e-mails são inválidos: ${invalidEmails.join(', ')}`);
      return;
    }

    qrCodeLock.current = true;
    setEmail(emails); // Salvar como array
    setClientName(possibleClientName || 'Nome não especificado');
    setLocation(possibleLocation || 'Local não especificado');
    setModalIsVisible(false);
  }

  async function sendEmail() {
    if (!email || !location || !clientName) {
      return Alert.alert('Erro', 'Dados incompletos. Escaneie o QR Code novamente.');
    }

    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);

    try {
      const response = await axios.post(`${API_URL}`, {
        email, // Enviar como array
        clientName,
        location,
        scannedAt: new Date(),
        username, // Passando o nome do usuário logado
      });

      if (!response.data.success) {
        Alert.alert('Erro', response.data.message || 'Falha ao enviar o e-mail');
      } else {
        setEmail(null);
        setClientName(null);
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

      {email && clientName && location && (
        <TouchableOpacity style={styles.sendButton} onPress={sendEmail}>
          <Text style={styles.buttonText}>Enviar E-mail</Text>
        </TouchableOpacity>
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
