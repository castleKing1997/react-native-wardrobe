
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Storage extends React.Component {
  static updateData = () => { console.log("updateData"); };

  static convertData(data: any[], name: string, id: any) {
    let dataDic: string[][] = [];
    data.forEach((element: { [x: string]: string; }) => {
      dataDic.push(["@" + name + "_" + element['id'], JSON.stringify(element)]);
    });
    return dataDic;
  };

  static getMyStringValue = async (key: string) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch (e) {
      console.log(e);
    };
  }

  static getMyObject = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) {
      console.log(e);
    }
  }

  static removeMyObject = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log(e);
    }
  }

  static setStringValue = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      console.log(e);
    }
  }

  static setObjectValue = async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
      console.log(e);
    }
  }

  static getAllKeys = async () => {
    let keys: string[] = []
    try {
      keys = await AsyncStorage.getAllKeys()
    } catch (e) {
      console.log(e);
    }
    return keys;
  }

  static getMultiple = async (keys: any[]) => {
    let values
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (e) {
      console.log(e);
    }
  }

  static multiSet = async (values: string[][]) => {
    try {
      await AsyncStorage.multiSet(values)
    } catch (e) {
      console.log(e);
    }
  }

  static matchKey = (keys: any[], regexp: string) => {
    let matchedKey: any[] = [];
    keys.forEach((element: string) => {
      if (element.match(regexp)) {
        matchedKey.push(element);
      }
    });
    return matchedKey;
  }
}
