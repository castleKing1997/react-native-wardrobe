import { useEffect, useReducer, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, ImageBackground, View, Text } from 'react-native';
import Storage from '../manage/Storage';
import { formatDate, getTimer } from '../utils/TimeUtils';
import { DatePicker } from "react-native-common-date-picker";

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
    default:
      throw new Error();
  }
};

export default function DressDetailScreen(props: any) {
  const id = props.route.params.id;
  const key = "@DRESS_" + id;
  const [value, dispatchValue] = useReducer(
    valueReducer,
    { data: null, isLoading: false, isError: false }
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const readItemFromStorage = async () => {
    dispatchValue({ type: 'VALUE_FETCH_INIT' });
    try {
      const item = await Storage.getMyObject(key);
      dispatchValue({
        type: 'VALUE_FETCH_SUCCESS',
        payload: item,
      });
    } catch (e) {
      console.log("DressDetailScreen.readItemFromStorage", e);
      dispatchValue({ type: 'VALUE_FETCH_FAILURE' })
    }
  };

  useEffect(() => { readItemFromStorage() }, [])

  let date = null;
  if (value.data) {
    date = (new Date(value.data?.date)).toLocaleDateString()
  } else {
    date = (new Date()).toLocaleDateString()
  }

  const handleDatePicker = (date: string) => {
    const timestamp = new Date(formatDate(date).replace("年", "/").replace("月", "/").replace("日", "")).getTime();
    let data = value.data;
    data.dressCount = data.dressCount + 1;
    data.date = timestamp > data.date ? timestamp : data.date;
    dispatchValue({ type: 'VALUE_FETCH_INIT' });
    try {
      dispatchValue({
        type: 'VALUE_FETCH_SUCCESS',
        payload: data,
      })
    } catch (e) {
      dispatchValue({ type: 'VALUE_FETCH_FAILURE' })
    }
    Storage.setObjectValue("@DRESS_" + data.id, data);
    setShowDatePicker(false);
  }

  const handleBulu = () => {
    setShowDatePicker(true);
  }

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.topContainer}>
          <ImageBackground style={styles.dressImage} source={{ uri: value.data?.uri }} resizeMode="cover" />
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>{value.data ? (value.data.name ? value.data.name : "我的小裙子") : "我的小裙子"}</Text>
          <Text style={styles.text}>上次穿：{formatDate(date)}</Text>
          <View style={styles.row}>
            <Text style={styles.text}>穿过：{value.data ? value.data.dressCount : 0}次</Text>
            <Pressable style={styles.btnSmall} onPress={() => handleBulu()}><Text>次数补录</Text></Pressable>
          </View>
          <Text style={styles.text}>入手时间：{value.data ? getTimer(value.data.buyDate, "刚刚入手！") : "刚刚入手！"}</Text>
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
    </>
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
  container: {
    height: 500,
    backgroundColor: '#fff',
    margin: 5,
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
  btnSmall: {
    marginTop: 7,
    marginLeft: 10,
    width: 70,
    height: 25,
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
  },
});
