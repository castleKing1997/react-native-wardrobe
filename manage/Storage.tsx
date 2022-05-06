
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Storage extends React.Component{
  static convertData(data, name, id) {
    let dataDic = [];
    data.forEach(element => {
      dataDic.push(["@"+name+"_"+element['id'], JSON.stringify(element)]);
    });
    return dataDic;
  };

  static getMyStringValue = async (key) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch(e) {
      console.log(e);
    };
  }

  static getMyObject = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch(e) {
      console.log(e);
    }
  }

  static setStringValue = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch(e) {
      console.log(e);
    }
  }

  static setObjectValue = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch(e) {
      console.log(e);
    }
  }

  static getAllKeys = async () => {
    let keys = []
    try {
      keys = await AsyncStorage.getAllKeys()
    } catch(e) {
      console.log(e);
    }
    return keys;
  }

  static getMultiple = async (keys) => {
    let values
    try {
      return await AsyncStorage.multiGet(keys);
    } catch(e) {
      console.log(e);
    }
  }

  static multiSet = async (values) => {
    try {
      await AsyncStorage.multiSet(values)
    } catch(e) {
      console.log(e);
    }
  }

  static matchKey = (keys, regexp) => {
    let matchedKey = [];
    keys.forEach(element => {
      if (element.match(regexp)) {
        matchedKey.push(element);
      }
    });
    return matchedKey;
  }
}
