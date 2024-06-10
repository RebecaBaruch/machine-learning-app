import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0D1117',
  },
  text_box: {
    flex: 1,
    justifyContent: 'center',
  },
  wellcome: {
    fontSize: 43,
    marginVertical: 12,
    color: '#FFFFFF',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  sub_title: {
    fontSize: 13,
    marginVertical: 12,
    color: '#FFFFFF',
    textAlign: 'left',
    fontWeight: 'light',
  },
  label: {
    fontSize: 20,
    marginVertical: 12,
    color: '#7b899a',
    textAlign: 'left',
    fontWeight: 'medium',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#21262D',
    borderColor: '#30363D',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFFFFF',
  },
  datasetName: {
    marginVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#21262D',
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'left',
    borderRadius: 10,
    borderColor: '#30363D',
    borderWidth: 1,
  },
  btn: {
    backgroundColor: '#B200FF',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 37,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    color: '#3784ff',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const HomeScreen = () => {
  const [dataset, setDataset] = useState(null);
  const [algorithm, setAlgorithm] = useState('knn');
  const [loading, setLoading] = useState(false);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const router = useRouter();

  const handleFilePick = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('DocumentPicker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        const simulatedFilePath = `bases/iris.data`;

        setDataset({ name, uri: simulatedFilePath });
        await AsyncStorage.setItem('dataset', JSON.stringify({ name, uri: simulatedFilePath }));
        setBaseLoaded(true);
        Alert.alert("Sucesso", "Base enviada!");
      } else {
        Alert.alert("Erro", "Nenhum arquivo selecionado :(");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Erro", "Erro ao selecionar o arquivo :(");
    }
  };

  const handleExecution = async () => {
    if ((algorithm === 'knn' || algorithm === 'arvore') && !dataset) {
      Alert.alert("Erro", "Selecione um conjunto de dados válido!");
      return;
    }

    let filePath = '';

    if (algorithm === 'knn' || algorithm === 'arvore') {
      let storedDataset = await AsyncStorage.getItem('dataset');
      storedDataset = storedDataset ? JSON.parse(storedDataset) : null;

      if (!storedDataset) {
        Alert.alert("Erro", "Selecione um conjunto de dados válido!");
        return;
      }

      filePath = storedDataset.uri;
    }

    try {
      setLoading(true);

      const classifyResponse = await fetch('http://192.168.1.91:5000/classify', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: filePath,
          algorithm: algorithm,
        }),
      });

      const classifyData = await classifyResponse.json();

      if (classifyResponse.status !== 200) {
        throw new Error(classifyData.erro);
      }

      router.push({
        pathname: '/result',
        params: { classifyData: JSON.stringify(classifyData) },
      });

    } catch (error) {
      Alert.alert("Erro", `Erro ao executar algoritmo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.text_box}>
        <Text style={styles.wellcome}>{`Seja bem vindo :)`}</Text>
        <Text style={styles.sub_title}>{`Neste app você pode escolher um algoritmo de IA e uma base de dados para ser analisada!`}</Text>
      </View>

      <Text style={styles.label}>Escolha o Algoritmo:</Text>

      <Picker
        selectedValue={algorithm}
        style={styles.picker}
        onValueChange={(itemValue) => setAlgorithm(itemValue)}
      >
        <Picker.Item label="Algoritmo Genético" value="algGenetico" />
        <Picker.Item label="KNN" value="knn" />
        <Picker.Item label="Árvore de Decisão" value="arvore" />
      </Picker>

      <Text style={styles.label}>Selecione a base de dados:</Text>

      <TouchableOpacity onPress={handleFilePick} style={styles.button}>
        <Text style={styles.buttonText}>Carregar Base</Text>
      </TouchableOpacity>

      {baseLoaded && (
        <Text style={styles.successText}>{`Base carregada :) -> `} {dataset.name}</Text>
      )}

      <TouchableOpacity onPress={handleExecution} style={styles.btn}>
        <Text style={styles.buttonText}>Executar Algoritmo</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#B200FF" />}
    </View>
  );
};

export default HomeScreen;
