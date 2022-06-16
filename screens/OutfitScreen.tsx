import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Card from '../components/Card';
import React, { useEffect, useReducer, useState } from 'react';
import { View } from '../components/Themed';
import Storage from '../manage/Storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmDialog } from 'react-native-simple-dialogs';

const getOutfitData = async () => {
  const items: any[] = []
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@OUTFIT_*");
    const outfitData = await Storage.getMultiple(matchedKey);
    outfitData?.forEach(element => {
      if (element[1]) {
        items.push(JSON.parse(element[1]));
      }
    });
  } catch (e) {
    console.log("OutfitSceen.getOutfitData", e);
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

export default function OutfitScreen(props: any) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false }
  );

  const [ascending, setAscending] = useState(false);
  const [sortAtt, setSortAtt] = useState("date");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [curId, setCurId] = useState("0");
  const [curName, setCurName] = useState("我的小套装");

  const readItemsFromStorage = async () => {
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getOutfitData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch (e) {
      console.log("OutfitScreen.readItemsFromStorage", e);
      dispatchValues({ type: 'VALUES_FETCH_FAILURE' })
    }
  };

  const removeItemFromStorage = async (key: string) => {
    try {
      await Storage.removeMyObject(key);
      readItemsFromStorage();
    } catch (e) {
      console.log("OutfitScreen.removeItemFromStorage", e);
    }
  }

  const writeItemToStorage = async (item: any) => {
    try {
      const id = "@OUTFIT_" + item.id;
      await Storage.setObjectValue(id, item);
      readItemsFromStorage();
    } catch (e) {
      console.log("OutfitScreen.writeItemToStorage", e);
    }
  };

  useEffect(() => {
    readItemsFromStorage();
    Storage.updateData = () => readItemsFromStorage();
  }, []);

  const handleLeftBtnPress = (item: any) => {
    item.date = new Date().getTime();
    item.outfitCount = item.outfitCount === undefined ? 1 : item.outfitCount + 1;
    writeItemToStorage(item);
  }

  const handleDeleteBtnPress = (id: string, name: string) => {
    setCurId(id);
    setCurName(name);
    setDialogVisible(true);
  }

  const handleDeleteConfirm = () => {
    deleteItem(curId);
    setDialogVisible(false);
  }

  const deleteItem = (id: string) => {
    const key = "@OUTFIT_" + id;
    removeItemFromStorage(key);
  }


  const handleCardPress = (id: string) => {
    props.navigation.navigate("OutfitDetail", { id: id });
  }

  const sortTypes = (a: any, b: any, sortAtt: string, ascending: boolean = false) => ascending ? b[sortAtt] - a[sortAtt] : a[sortAtt] - b[sortAtt]

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerContainer}>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "date" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("date") }}>
          <Text style={styles.smallText}>按使用时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "outfitCount" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("outfitCount") }}>
          <Text style={styles.smallText}>按使用次数</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "createDate" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("createDate") }}>
          <Text style={styles.smallText}>按创建时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { right: 8, position: 'absolute', width: 24 }]} onPress={() => { setAscending(!ascending) }}>
          <MaterialCommunityIcons name={ascending ? "arrow-up" : "arrow-down"} size={22} color="#aaa" />
        </Pressable>
      </View>
      <View style={styles.container}>
        {values.data.sort((a: any, b: any) => sortTypes(a, b, sortAtt, ascending)).map((data: { uri: string; id: string; date: number; name: string; }) => (
          <Card uri={data.uri} key={data.id} onLeftBtnPress={() => handleLeftBtnPress(data)} onDeleteBtnPress={() => handleDeleteBtnPress(data.id, data.name)} onCardPress={() => handleCardPress(data.id)} date={data.date} />
        ))}
      </View>
      <ConfirmDialog
        title="确认删除"
        message={"是否删除“" + (curName ? curName : "我的小套装") + "”？"}
        visible={dialogVisible}
        messageStyle={{}}
        contentStyle={{}}
        titleStyle={{}}
        buttonsStyle={{}}
        onTouchOutside={() => setDialogVisible(false)}
        positiveButton={{
          title: "否",
          onPress: () => setDialogVisible(false)
        }}
        negativeButton={{
          title: "是",
          onPress: () => handleDeleteConfirm()
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

