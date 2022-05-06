import { ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { Text, View } from '../components/Themed';
import Storage from '../manage/Storage';

const handleLeftBtnPress = item => {
  item.date = new Date().getTime();
  console.log(item);
}

export default function TabTwoScreen() {
  const [values, setValues] = useState([]);
  const { getItems, setItems } = useAsyncStorage('@DRESS_DATA');
  
  const readItemsFromStorage = async () => {
    try {
      const keys = await Storage.getAllKeys();
      const matchedKey = Storage.matchKey(keys, "@DRESS_*");
      const dressData = await Storage.getMultiple(matchedKey);
      const items = []
      dressData.forEach(element => {
        console.log(element);
        items.push(JSON.parse(element[1]));
      });
      setValues(items);
    } catch(e) {
      console.log(e);
      setValues([]);
    }
    
  };

  const writeItemsToStorage = async newValues => {
    await setItems(newValues);
    setValues(newValues);
  };

  useEffect(() => {
    readItemsFromStorage();
  }, []);

  return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {values.sort((a,b)=>a.date-b.date).map((data) => (
            <Card uri={data.uri} key={data.id} onLeftBtnPress={()=>handleLeftBtnPress(data)}/>
          ))}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: '#fff',
  },
  card: {
    alignSelf: 'flex-start',
  }
});
