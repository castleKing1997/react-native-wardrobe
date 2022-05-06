import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DATA = [
  {
    id: 1,
    uri: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 2,
    uri: 'https://reactnative.dev/img/tiny_logo.png',
  },
  {
    id: 3,
    uri: 'https://reactnative.dev/img/tiny_logo.png',
  },
]

export default function TabThreeScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const { getItem, setItem } = useAsyncStorage('@DRESS_DATA');
  return (
    <View style={{ margin: 40 }}>
      <TouchableOpacity
        onPress={() =>
          {
            setItem(JSON.stringify(DATA));
          }
        }
      >
        <Text>Save Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});