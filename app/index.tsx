import React, { useState } from 'react'
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Modal, FlatList } from 'react-native'
import { Picker } from "@react-native-picker/picker"
import axios from 'axios'
import { shareAsync } from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import cliente1 from '@/constants/Variantes'
import Constants from 'expo-constants';

interface VariaveisConfiguracao {
  API_URL: string,
  SECRET_KEY: string
}

const App = () => {
  const { API_URL, SECRET_KEY } = Constants.expoConfig?.extra as VariaveisConfiguracao
  const modelos = cliente1.modelosRelatorio

  const [dados, setDados] = useState({
    AVALIANDO: '',
    ARTIGO_AVALIANDO: 'o',
    ARTIGO_AVALIANDO_2: 'e',
    ARTIGO_AVALIANDO_MAIUSC: 'O',
    ARTIGO_AVALIANDO_NEUTRO: 'e',
    PRONOME_AVALIANDO: 'ele',
    PRONOME_AVALIANDO_MAIUSC: 'Ele',
    NUMERAL_AVALIANDO: 'um',
    NUMERAL_AVALIANDO_MAIUSC: 'Um',
    IDADE_ANOS: '',
    IDADE_MESES: '',
    ESCOLARIDADE: 'Fundamental II',
    VINCULO_FAMILIAR: '',
    RESPONSAVEL_1: '',
    RESPONSAVEL_2: '',
    DATA_INICIO: '',
    DATA_FINAL: '',
    SOLICITANTE: '',
    reportTemplate: ''
  })
  const [modalVisivel, setModalVisivel] = useState(false)

  const alterarProp = (key: string, value: string) => {
    setDados(prevState => ({ ...prevState, [key]: value }))
  }

  const gerarRelatorio = async () => {
    try {
      const respostaToken = await axios.post(
        `${API_URL}/get-token`,
        { secretKey: SECRET_KEY }
      )
      const token = respostaToken.data.token

      const respostaRelatorio = await axios.post(
        `${API_URL}/generate-report`,
        dados,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const arquivoBase64 = respostaRelatorio.data.file
      const arquivoURI = `${FileSystem.documentDirectory}relatorio.docx`

      await FileSystem.writeAsStringAsync(arquivoURI, arquivoBase64, { encoding: FileSystem.EncodingType.Base64 })

      Alert.alert('Relatório gerado!', 'Deseja abrir o relatório?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => compartilharRelatorio(arquivoURI) }
      ])
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar o relatório. Tente novamente.')
      console.error(error)
    }
  }

  const compartilharRelatorio = async (arquivoURI: string) => {
    try {
      await shareAsync(arquivoURI)
    } catch (erro) {
      console.error('Erro ao abrir o arquivo:', erro)
    }
  }

  return (
    <SafeAreaView style={styles.area}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>{cliente1.tituloApp}</Text>

        <Text style={styles.label}>Avaliando(a):</Text>
        <TextInput style={styles.input} value={dados.AVALIANDO} onChangeText={text => alterarProp('AVALIANDO', text)} />

        <Text style={styles.label}>Gênero do(a) Avaliando(a):</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dados.ARTIGO_AVALIANDO}
            onValueChange={(item: string) => {
              const gender: { [key: string]: string } = {
                ARTIGO_AVALIANDO: item as string,
                ARTIGO_AVALIANDO_2: item === 'o' ? 'e' : item as string,
                ARTIGO_AVALIANDO_MAIUSC: item.toLocaleUpperCase() as string,
                ARTIGO_AVALIANDO_NEUTRO: 'e',
                PRONOME_AVALIANDO: item === 'o' ? 'ele' : 'ela',
                PRONOME_AVALIANDO_MAIUSC: item === 'o' ? 'Ele' : 'Ela',
                NUMERAL_AVALIANDO: item === 'o' ? 'um' : 'uma',
                NUMERAL_AVALIANDO_MAIUSC: item === 'o' ? 'Um' : 'Uma'
              }
              Object.keys(gender).forEach(key => alterarProp(key, gender[key]))
              alterarProp('ARTIGO_AVALIANDO', item)
              alterarProp('ARTIGO_AVALIANDO_2', gender.ARTIGO_AVALIANDO_2)
              alterarProp('ARTIGO_AVALIANDO_MAIUSC', gender.ARTIGO_AVALIANDO_MAIUSC)
              alterarProp('ARTIGO_AVALIANDO_NEUTRO', gender.ARTIGO_AVALIANDO_NEUTRO)
              alterarProp('PRONOME_AVALIANDO', gender.PRONOME_AVALIANDO)
              alterarProp('PRONOME_AVALIANDO_MAIUSC', gender.PRONOME_AVALIANDO)
              alterarProp('NUMERAL_AVALIANDO', gender.NUMERAL_AVALIANDO)
              alterarProp('NUMERAL_AVALIANDO_MAIUSC', gender.NUMERAL_AVALIANDO)
            }}
            style={styles.picker}
          >
            <Picker.Item label="Masculino" value="o" />
            <Picker.Item label="Feminino" value="a" />
          </Picker>
        </View>

        <Text style={styles.label}>Idade (Anos):</Text>
        <TextInput style={styles.input} keyboardType='numeric' value={dados.IDADE_ANOS} onChangeText={text => alterarProp('IDADE_ANOS', text)} />

        <Text style={styles.label}>Idade (Meses):</Text>
        <TextInput style={styles.input} keyboardType='numeric' value={dados.IDADE_MESES} onChangeText={text => alterarProp('IDADE_MESES', text)} />

        <Text style={styles.label}>Escolaridade:</Text>
        <View style={styles.pickerContainer}>
          <Picker style={styles.picker} selectedValue={dados.ESCOLARIDADE} onValueChange={(item) => alterarProp('ESCOLARIDADE', item)}>
            <Picker.Item label="Maternal" value="Maternal" />
            <Picker.Item label="Jardim de Infância" value="Jardim de Infância" />
            <Picker.Item label="Alfabetização" value="Alfabetização" />
            <Picker.Item label="Fundamental I" value="Fundamental I" />
            <Picker.Item label="Fundamental II" value="Fundamental II" />
            <Picker.Item label="Ensino Médio" value="Ensino Médio" />
            <Picker.Item label="Ensino Superior" value="Ensino Superior" />
          </Picker>
        </View>

        <Text style={styles.label}>Vínculo Familiar:</Text>
        <TextInput style={styles.input} value={dados.VINCULO_FAMILIAR} onChangeText={text => alterarProp('VINCULO_FAMILIAR', text)} />

        <Text style={styles.label}>Responsável 1:</Text>
        <TextInput style={styles.input} value={dados.RESPONSAVEL_1} onChangeText={text => alterarProp('RESPONSAVEL_1', text)} />

        <Text style={styles.label}>Responsável 2:</Text>
        <TextInput style={styles.input} value={dados.RESPONSAVEL_2} onChangeText={text => alterarProp('RESPONSAVEL_2', text)} />

        <Text style={styles.label}>Data de Início:</Text>
        <TextInput style={styles.input} value={dados.DATA_INICIO} onChangeText={text => alterarProp('DATA_INICIO', text)} />

        <Text style={styles.label}>Data Final:</Text>
        <TextInput style={styles.input} value={dados.DATA_FINAL} onChangeText={text => alterarProp('DATA_FINAL', text)} />

        <Text style={styles.label}>Solicitante:</Text>
        <TextInput style={styles.input} value={dados.SOLICITANTE} onChangeText={text => alterarProp('SOLICITANTE', text)} />


        <Text style={styles.label}>Modelo do Relatório:</Text>
        <View style={styles.input}>
          <TouchableOpacity onPress={() => setModalVisivel(true)}>
            <Text>{dados.reportTemplate}</Text>
          </TouchableOpacity>

          <Modal visible={modalVisivel} animationType="slide">
            <SafeAreaView style={{ flex: 1 }}>
              <FlatList
                data={modelos}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 20, borderBottomWidth: 1 }}
                    onPress={() => {
                      alterarProp('reportTemplate', item.value)
                      setModalVisivel(false)
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.botaoFecharModal} onPress={() => setModalVisivel(false)}>
                <Text style={styles.textoBotao}>Fechar</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
        </View>
        <TouchableOpacity style={styles.botaoCompartilhar} onPress={gerarRelatorio}>
          <Text style={styles.textoBotao}>Gerar Relatório</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b345ad',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#390e3b',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b345ad',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  botaoCompartilhar: {
    backgroundColor: '#b345ad',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoFecharModal: {
    backgroundColor: '#b345ad',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#b345ad',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#fff',
  }
})

export default App
