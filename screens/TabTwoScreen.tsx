import { BackHandler, ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Text, View } from '../components/Themed';
import Storage from '../manage/Storage';
import { useFocusEffect } from '@react-navigation/native';
import Navigation from '../navigation';

const getDressData = async () => {
  const items = []
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@DRESS_*");
    const dressData = await Storage.getMultiple(matchedKey);
    dressData.forEach(element => {
      // console.log("TabTowScreen.getDressData", element);
      items.push(JSON.parse(element[1]));
    });
  } catch(e) {
    console.log("TabTwoSceen.getDressData", e);
  }
  return items;
};

// const writeDressData = async (data) => {
//   try {
//     const convertedData = Storage.convertData(data, "DRESS", "key");
//     await Storage.multiSet(convertedData);
//   } catch(e) {
//     console.log(e);
//   }
// }

const valuesReducer = (state, action) => {
  switch (action.type) {
  case 'VALUES_FETCH_INIT':
    return {
      ...state,
      isLoading: true,
      isError: false,
    };
  case 'VALUES_FETCH_SUCCESS':
    return {
      ...state,
      isLoading: false,
      isError: false,
      data: action.payload,
    };
  case 'VALUES_FETCH_FAILURE':
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  case 'REMOVE_VALUE':
    return {
      ...state,
      data: state.data.filter(
      value => action.payload.key !== value.key
      ),
    };
  case 'UPDATE_VALUE':
    return {
      ...state,
    }
  case 'UPDATE_VALUE_SUCCESS':
    return {
      ...state,
      isUpdating: false,
      isError: false,
    };
  case 'UPDATE_VALUE_INIT':
    return {
      ...state,
      isUpdating: true,
    };
  case 'UPDATE_VALUE_FAILURE':
    return {
      ...state,
      isUpdating: false,
      isError: true,
    };
  default:
    throw new Error();
  }
};

export default function TabTwoScreen(props) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false}
  );

  const readItemsFromStorage = async () => {
    console.log("TabTwoScreen.readItemsFromStorage")
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getDressData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch(e) {
      console.log("TabTwoScreen.readItemsFromStorage", e);
      dispatchValues({ type: 'VALUES_FETCH_FAILURE' })
    }
  };

  const writeItemToStorage = async item => {
    // dispatchValues({ type: 'UPDATE_VALUE_INIT' });
    console.log("TabTwoScreen.writeItemToStorage",item)
    try {
      const id = "@DRESS_"+item.id;
      await Storage.setObjectValue(id, item);
      readItemsFromStorage();
      // dispatchValues({
      //   type: 'UPDATE_VALUE_SUCCESS',
      // });
    } catch(e) {
      console.log("TabTwoScreen.writeItemToStorage", e);
      dispatchValues({ type: 'UPDATE_VALUE_FAILURE' })
    }
  };

  useEffect(() => {
    readItemsFromStorage();
    Storage.updateData = () => readItemsFromStorage();
    // console.log("TabTwoScreen.init", props);
    // console.log(props.navigate.route.params)
  }, []);

  const handleUpdateValue = item => {
    console.log("TabTwoScreen.handleUpdateValue", item);
    writeItemToStorage(item);
  };

  const handleLeftBtnPress = item => {
    console.log("TabTwoScreen.handleLeftBtnPress", item);
    item.date = new Date().getTime();
    handleUpdateValue(item);
  }
  
  console.log("TabTwoSceen", values);
  return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {values.data.sort((a,b)=>a.date-b.date).map((data) => (
            <Card uri={data.uri} key={data.id} onLeftBtnPress={()=>handleLeftBtnPress(data)} date={data.date}/>
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

