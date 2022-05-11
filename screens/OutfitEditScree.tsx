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
    default:
      throw new Error();
  }
};

export default function OutfitEditScreen(props: any) {
  const id = props.route.params.id;
  const type = props.route.params.type;
  const key = "@OUTFIT_" + id;
  const [value, dispatchValue] = useReducer(
    valueReducer,
    { data: null, isLoading: false, isError: false }
  );

  const readItemFromStorage = async () => {
    dispatchValue({ type: 'VALUE_FETCH_INIT' });
    try {
      const item = await Storage.getMyObject(key);
      setOutfitName(item.name);
      if (item.hasOwnProperty("createDate")) {
        setcreateDate(formatDate(new Date(item.createDate).toLocaleDateString()));
      }
      if (item.hasOwnProperty("date")) {
        setLatestDate(formatDate(new Date(item.date).toLocaleDateString()));
      }

      dispatchValue({
        type: 'VALUE_FETCH_SUCCESS',
        payload: item,
      });
    } catch (e) {
      console.log("OutfitScreen.readItemFromStorage", e);
      dispatchValue({ type: 'VALUE_FETCH_FAILURE' })
    }
  };

  useEffect(() => {
    readItemFromStorage();
    Storage.updateOutfitEdit = async () => {
      dispatchValue({ type: 'VALUE_FETCH_INIT' });
      try {
        const item = await Storage.getMyObject(key);
        dispatchValue({
          type: 'VALUE_FETCH_SUCCESS',
          payload: item,
        });
      } catch (e) {
        console.log("OutfitScreen.readItemFromStorage", e);
        dispatchValue({ type: 'VALUE_FETCH_FAILURE' })
      }
    };
  }, [])

  const [outfitName, setOutfitName] = useState("");
  const [createDate, setcreateDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSubmit = async () => {
    const outfitInfo = {
      id: id,
      uri: value.data?.uri,
      name: outfitName,
      dressItems: value.data?.dressItems,
      createDate: new Date(createDate.replace("年", "/").replace("月", "/").replace("日", "")).getTime(),
      date: new Date(latestDate.replace("年", "/").replace("月", "/").replace("日", "")).getTime(),
      outfitCount: 0,
    }

    await Storage.setObjectValue("@OUTFIT_" + id, outfitInfo);
    Storage.updateData();
    props.navigation.navigate("Outfit");
  };

  const onCancel = () => {
    if (type === "set") {
      Storage.removeMyObject("@OUTFIT_" + id);
    }
    props.navigation.navigate("Outfit");
  };

  const [dateFor, setDateFor] = useState("");

  const handleDatePicker = (date: string) => {
    if (dateFor === "latest") {
      setLatestDate(formatDate(date));
    } else if (dateFor === "create") {
      setcreateDate(formatDate(date));
    } else {
      console.error("日期赋值对象错误！");
    }
    setShowDatePicker(false);
  }


  return (
    <View style={styles.containerAll}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.topContainer}>
          <ImageBackground style={styles.outfitImage} source={{ uri: value.data?.uri }} resizeMode="cover" />
        </View>
        <View style={styles.container}>
          <View style={styles.chooseContainer}>
            {value.data?.dressItems.map((dress: any) => (
              <Pressable key={dress[0]} style={[styles.dressBtn, { paddingTop: 3, backgroundColor: "#abc" }]}>
                <Text style={styles.smallText}>{dress[1]}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.dressBtn, { paddingTop: 3 }]} onPress={() => { props.navigation.navigate("DressChoose", { outfitId: id }) }}>
              <Text style={styles.smallText}>添加单品</Text>
            </Pressable>
          </View>
          <TextInput
            value={outfitName || ""}
            onChangeText={(x) => { setOutfitName(x) }}
            placeholder={'给这个搭配起个名儿……'}
            style={styles.input}
          />
          <TextInput
            value={latestDate || ""}
            onChangeText={(x) => { setLatestDate(x) }}
            onFocus={() => { setShowDatePicker(true); setDateFor("latest"); }}
            onEndEditing={() => { setShowDatePicker(false); setDateFor(""); }}
            placeholder={'最近一次这样穿……'}
            style={styles.input}
          />
          <TextInput
            value={createDate || ""}
            onChangeText={(x) => { setcreateDate(x) }}
            onFocus={() => { setShowDatePicker(true); setDateFor("create"); }}
            onEndEditing={() => { setShowDatePicker(false); setDateFor(""); }}
            placeholder={'第一次这样搭配……'}
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
  outfitImage: {
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
  chooseContainer: {
    width: '100%',
    minHeight: 30,
    paddingHorizontal: 4,
    paddingTop: 4,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
    fontSize: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dressBtn: {
    height: 30,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    marginBottom: 4,
    backgroundColor: "#cab",
    borderRadius: 15,
    alignItems: 'center',
    alignContent: 'center',
    paddingTop: 3,
  },
  smallText: {
    fontSize: 16,
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
