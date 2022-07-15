import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Card from '../components/Card';
import React, { useEffect, useReducer, useState } from 'react';
import { View } from '../components/Themed';
import Storage from '../manage/Storage';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AwesomeAlert from 'react-native-awesome-alerts';

const getDressData = async () => {
  const items: any[] = []
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@DRESS_*");
    const dressData = await Storage.getMultiple(matchedKey);
    dressData?.forEach(element => {
      if (element[1]) {
        items.push(JSON.parse(element[1]));
      }
    });
  } catch (e) {
    console.log("DressSceen.getDressData", e);
  }
  return items;
};


const valuesReducer = (state: any, action: any) => {
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
    default:
      throw new Error();
  }
};

export default function DressScreen(props: any) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false }
  );

  const [ascending, setAscending] = useState(false);
  const [visible, setVisible] = useState(true);
  const [sortAtt, setSortAtt] = useState("date");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [curId, setCurId] = useState("0");
  const [curName, setCurName] = useState("我的小裙子");

  const readItemsFromStorage = async () => {
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getDressData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch (e) {
      console.log("DressScreen.readItemsFromStorage", e);
      dispatchValues({ type: 'VALUES_FETCH_FAILURE' })
    }
  };

  const removeItemFromStorage = async (key: string) => {
    try {
      await Storage.removeMyObject(key);
      readItemsFromStorage();
    } catch (e) {
      console.log("DressScreen.removeItemFromStorage", e);
    }
  }

  const writeItemToStorage = async (item: any) => {
    try {
      const id = "@DRESS_" + item.id;
      await Storage.setObjectValue(id, item);
      readItemsFromStorage();
    } catch (e) {
      console.log("DressScreen.writeItemToStorage", e);
    }
  };

  useEffect(() => {
    readItemsFromStorage();
    Storage.updateDressData = () => readItemsFromStorage();
  }, []);

  const handleLeftBtnPress = (item: any) => {
    item.date = new Date().getTime();
    item.dressCount = item.dressCount === undefined ? 1 : item.dressCount + 1;
    writeItemToStorage(item);
  }

  const handleDeleteBtnPress = (id: string, name: string) => {
    setCurId(id);
    setCurName(name);
    setDialogVisible(true);
  }

  const handleVisibleBtnPress = (item: any) => {
    item.isVisible = item.isVisible === undefined ? false : !item.isVisible;
    writeItemToStorage(item);
  }

  const handleDeleteConfirm = () => {
    deleteItem(curId);
    setDialogVisible(false);
  }

  const deleteItem = (id: string) => {
    const key = "@DRESS_" + id;
    removeItemFromStorage(key);
  }

  const handleCardPress = (id: string) => {
    props.navigation.navigate("DressDetail", { id: id });
  }


  const sortTypes = (a: any, b: any, sortAtt: string, ascending: boolean = false) => ascending ? b[sortAtt] - a[sortAtt] : a[sortAtt] - b[sortAtt]

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerContainer}>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "date" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("date") }}>
          <Text style={styles.smallText}>按使用时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "dressCount" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("dressCount") }}>
          <Text style={styles.smallText}>按使用次数</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "buyDate" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("buyDate") }}>
          <Text style={styles.smallText}>按购买时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { right: 40, position: 'absolute', width: 24 }]} onPress={() => { setVisible(!visible) }}>
          <MaterialIcons name={visible ? "visibility" : "visibility-off"} size={22} color="#aaa" />
        </Pressable>
        <Pressable style={[styles.headerBtn, { right: 8, position: 'absolute', width: 24 }]} onPress={() => { setAscending(!ascending) }}>
          <MaterialCommunityIcons name={ascending ? "arrow-up" : "arrow-down"} size={22} color="#aaa" />
        </Pressable>
      </View>
      <View style={styles.container}>
        {values.data.filter((item: any) => item.isVisible === visible || visible && item.isVisible === undefined).sort((a: any, b: any) => sortTypes(a, b, sortAtt, ascending)).map((data: { isVisible: boolean; uri: string; id: string; date: number; name: string; }) => (
          <Card isVisible={data.isVisible === undefined ? true : data.isVisible} uri={data.uri} key={data.id} onLeftBtnPress={() => handleLeftBtnPress(data)} onDeleteBtnPress={() => handleDeleteBtnPress(data.id, data.name)} onCardPress={() => handleCardPress(data.id)} date={data.date} onVisBtnPress={() => handleVisibleBtnPress(data)} />
        ))}
      </View>
      <AwesomeAlert
        show={dialogVisible}
        showProgress={false}
        title="确认删除"
        message={"是否删除“" + (curName ? curName : "我的小裙子") + "”？"}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="否"
        confirmText="是"
        confirmButtonColor="#DD6B55"
        onCancelPressed={() => {
          setDialogVisible(false);
        }}
        onConfirmPressed={() => {
          handleDeleteConfirm();
        }}
      />
      <View style={styles.bottomContainer}><Text>--到底啦--</Text></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  headerContainer: {
    height: 30,
    flexDirection: 'row',
    backgroundColor: "#ddd",
    position: 'relative',
    alignItems: 'center',
  },
  headerBtn: {
    height: 24,
    width: 80,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: 'center',
    alignContent: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  bottomContainer: {
    height: 20,
    backgroundColor: "#ddd",
    alignContent: 'center',
    alignItems: 'center',
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

