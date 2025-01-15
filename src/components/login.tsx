import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../server/db'; 

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(''); // Limpa mensagens de erro anteriores
    if (!username && !password) {
      showErrorMessage('Por favor, preencha o usuário e a senha.');
      return;
    }

    if (!username) {
      showErrorMessage('Por favor, preencha o nome de usuário.');
      return;
    }

    if (!password) {
      showErrorMessage('Por favor, preencha a senha.');
      return;
    }

    setIsLoading(true); // Ativa o indicador de carregamento

    // Verifica as credenciais no banco de dados do Supabase
    const { data, error } = await supabase
      .from('mvt') // A tabela onde os usuários estão armazenados
      .select('username, password') // Remove a coluna signature
      .eq('username', username) // Verifica se o username bate
      .eq('password', password)
      .single(); 

    setIsLoading(false); // Desativa o indicador de carregamento

    if (error || !data) {
      showErrorMessage('Credenciais inválidas');
    } else {
      // Navega para a tela inicial
      navigation.navigate('Home', { username: data.username });
    }
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(''); // Limpa a mensagem após 3 segundos
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>

      {/* Campo de Username */}
      <TextInput
        style={[styles.input, username && styles.inputActive]} // Adiciona estilo ativo quando o campo tem valor
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />

      {/* Campo de Senha */}
      <TextInput
        style={[styles.input, password && styles.inputActive]} // Adiciona estilo ativo quando o campo tem valor
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
      />

      {/* Mensagem de erro */}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* Indicador de carregamento */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#333', 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#555', 
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    borderRadius: 8,
    backgroundColor: '#444', 
    color: '#fff', 
    fontSize: 16,
  },
  inputActive: {
    borderColor: '#007BFF', 
  },
  error: {
    color: '#B0B0B0', 
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007BFF', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default LoginScreen;
