import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ResultScreen = () => {
  const router = useRouter();
  const { classifyData } = useLocalSearchParams();

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#0D1117',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: '#21262D',
      paddingVertical: 10,
      borderRadius: 10,
      borderColor: '#30363D',
      borderWidth: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginLeft: 10,
    },
    backButton: {
      position: 'absolute',
      left: 10,
    },
    text: {
      fontSize: 16,
      marginVertical: 2,
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    table: {
      borderWidth: 1,
      borderColor: '#56616E',
      borderRadius: 8,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#56616E',
    },
    tableCell: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 5,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    bestResult: {
      backgroundColor: 'rgba(23, 105, 255, 0.5)',
    },
    bestResultText: {
      backgroundColor: 'rgba(23, 105, 255, 0.5)',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 5,
    },
    image: {
      width: 300,
      height: 300,
      marginTop: 20,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
  });

  if (!classifyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Nenhum dado disponível</Text>
      </View>
    );
  }

  const data = JSON.parse(classifyData);

  const renderTable = (data) => {
    const rows = data.output.split('\n').filter(line => line.trim() !== '');
    const bestResult = rows.reduce((best, current) => {
      const currentAccuracy = parseFloat(current.split(' ').slice(-1)[0].match(/[\d.]+/));
      if (!best || currentAccuracy > best.accuracy) {
        return { row: current, accuracy: currentAccuracy };
      }
      return best;
    }, null);

    return (
      <View style={styles.table}>
        {rows.map((row, index) => {
          const isBestResult = row === bestResult.row;
          return (
            <View key={index} style={styles.tableRow}>
              {isBestResult ? (
                <Text style={[styles.tableCell, styles.bestResultText]}>{row.trim()}</Text>
              ) : (
                <Text style={styles.tableCell}>{row.trim()}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultados:</Text>
      </View>
      {renderTable(data)}
      {data.imagem && (
        <Image
          style={styles.image}
          source={{ uri: `http://192.168.1.91:5000/${data.imagem}` }}
        />
      )}
    </ScrollView>
  );
};

export default ResultScreen;
