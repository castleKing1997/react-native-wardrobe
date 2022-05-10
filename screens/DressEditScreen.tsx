import React, { useEffect, useReducer, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, ImageBackground, View, Text, TextInput, Button } from 'react-native';
import Storage from '../manage/Storage';
import { DatePicker } from "react-native-common-date-picker";
import { formatDate } from '../utils/TimeUtils';

const valueReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'VALUE_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'VALUE_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'VALUE_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'VALUE_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'UPDATE_USERNAME':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: { ...state.data, dressName: action.payload },
      };
    default:
      throw new Error();
  }
};

export default function DressEditScreen(props: any) {
  const id = props.route.params.id;
  const type = props.route.params.type;
  const key = "@DRESS_" + id;
  const [value, dispatchValue] = useReducer(
    valueReducer,
    { data: null, isLoading: false, isError: false }
  );

  const readItemFromStorage = async () => {
    dispatchValue({ type: 'VALUE_FETCH_INIT' });
    try {
      const item = await Storage.getMyObject(key);
      setDressName(item.name);
      if (item.hasOwnProperty("buyDate")) {
        setBuyDate(formatDate(new Date(item.buyDate).toLocaleDateString()));
      }
      if (item.hasOwnProperty("date")) {
        setLatestDate(formatDate(new Date(item.date).toLocaleDateString()));
      }

      dispatchValue({
        type: 'VALUE_FETCH_SUCCESS',
        payload: item,
      });
    } catch (e) {
      console.log("WardrobeScreen.readItemFromStorage", e);
      dispatchValue({ type: 'VALUE_FETCH_FAILURE' })
    }
  };
  useEffect(() => { readItemFromStorage() }, [])
  const [dressName, setDressName] = useState("");
  const [buyDate, setBuyDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSubmit = async () => {
    const dressInfo = {
      id: id,
      uri: value.data?.uri,
      name: dressName,
      buyDate: new Date(buyDate.replace("年", "/").replace("月", "/").replace("日", "")).getTime(),
      date: new Date(latestDate.replace("年", "/").replace("月", "/").replace("日", "")).getTime(),
      dressCount: 0,
    }

    await Storage.setObjectValue("@DRESS_" + id, dressInfo);
    Storage.updateData();
    props.navigation.navigate("Wardrobe");
  };

  const onCancel = () => {
    if (type === "set") {
      Storage.removeMyObject("@DRESS_" + id);
    }
    props.navigation.navigate("Wardrobe");
  };

  const [dateFor, setDateFor] = useState("");

  const handleDatePicker = (date: string) => {
    if (dateFor === "latest") {
      setLatestDate(formatDate(date));
    } else if (dateFor === "buy") {
      setBuyDate(formatDate(date));
    } else {
      console.error("日期赋值对象错误！");
    }
    setShowDatePicker(false);
  }
  return (
    <View style={styles.containerAll}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.topContainer}>
          <ImageBackground style={styles.dressImage} source={{ uri: value.data?.uri }} resizeMode="cover" />
        </View>
        <View style={styles.container}>
          <TextInput
            value={dressName}
            onChangeText={(x) => { setDressName(x) }}
            placeholder={'给ta起个名儿……'}
            style={styles.input}
          />
          <TextInput
            value={latestDate}
            onChangeText={(x) => { setLatestDate(x) }}
            onFocus={() => { setShowDatePicker(true); setDateFor("latest"); }}
            onEndEditing={() => { setShowDatePicker(false); setDateFor(""); }}
            placeholder={'最近一次穿ta……'}
            style={styles.input}
          />
          <TextInput
            value={buyDate}
            onChangeText={(x) => { setBuyDate(x) }}
            onFocus={() => { setShowDatePicker(true); setDateFor("buy"); }}
            onEndEditing={() => { setShowDatePicker(false); setDateFor(""); }}
            placeholder={'啥时候买的？（大概）'}
            style={styles.input}
          />
          <Pressable style={styles.submitBtn} onPress={onSubmit}>
            <Text style={{ fontSize: 16 }}>确认</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={{ fontSize: 16 }}>取消</Text>
          </Pressable>
        </View>
      </ScrollView>
      {showDatePicker && (<DatePicker
        type="YYYY-MM-DD"
        toolBarPosition="bottom"
        cancel={() => { setShowDatePicker(false) }}
        yearSuffix={'年'}
        monthSuffix={'月'}
        daySuffix={'日'}
        confirm={(date: string) => { handleDatePicker(date) }}
      />)}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: '#ddd',
  },
  topContainer: {
    backgroundColor: '#fff',
  },
  containerAll: {
    backgroundColor: '#fff',
    height: '100%',
  },
  container: {
    backgroundColor: '#fff',
    marginVertical: 5,
    padding: 5,
  },
  dressImage: {
    width: '100%',
    height: 250,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "#222",
    marginLeft: 5,
    marginTop: 5,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    color: "#444",
    marginLeft: 10,
    marginTop: 5,
  },
  input: {
    width: '100%',
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
    fontSize: 20,
  },
  submitBtn: {
    marginVertical: 5,
    width: '100%',
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#abc',
    alignContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    marginVertical: 5,
    width: '100%',
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#aaa',
    alignContent: 'center',
    alignItems: 'center',
  },
});
