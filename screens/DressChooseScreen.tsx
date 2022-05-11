import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Card from '../components/Card';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View } from '../components/Themed';
import Storage from '../manage/Storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    case 'VALUE_UPDATE_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'VALUE_UPDATE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: {
          ...state.data,
          ...action.payload,
        }
      };
    case 'VALUE_UPDATE_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

export default function DressChooseScreen(props: any) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false }
  );

  const [outfitValue, dispatchOutfitValue] = useReducer(
    valueReducer,
    { data: null, isLoading: false, isError: false, isUpdating: false }
  );

  const outfitValueRef: any = useRef(null);

  const outfitId = props.route.params.outfitId;

  const [ascending, setAscending] = useState(false);
  const [sortAtt, setSortAtt] = useState("date");

  const readItemsFromStorage = async () => {
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getDressData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch (e) {
      console.log("DressChooseScreen.readItemsFromStorage", e);
      dispatchValues({ type: 'VALUES_FETCH_FAILURE' })
    }
  };

  const readOutfitFromStorage = async () => {
    dispatchOutfitValue({ type: 'VALUE_FETCH_INIT' });
    try {
      const key = "@OUTFIT_" + outfitId;
      const item = await Storage.getMyObject(key);
      dispatchOutfitValue({
        type: 'VALUE_FETCH_SUCCESS',
        payload: item,
      });
    } catch (e) {
      console.log("DressChooseScreen.readOutfitFromStorage", e);
      dispatchOutfitValue({ type: 'VALUE_FETCH_FAILURE' })
    }
  };

  const handleConfirm = async () => {
    const key = "@OUTFIT_" + outfitId;
    await Storage.setObjectValue(key, outfitValueRef.current.data);
    await Storage.updateOutfitEdit();
    props.navigation.navigate("OutfitEdit", { id: outfitId, type: "set" });
  }

  useEffect(() => {
    readItemsFromStorage();
    readOutfitFromStorage();
    Storage.chooseDress = () => handleConfirm();
  }, []);

  useEffect(() => {
    outfitValueRef.current = outfitValue;
  }, [outfitValue])


  const handleChooseBtnPress = (id: string, name: string) => {
    if (outfitValue.data.dressItems.flat().includes(id)) {
      dispatchOutfitValue({ type: 'VALUE_UPDATE_INIT' });
      try {
        dispatchOutfitValue({
          type: 'VALUE_UPDATE_SUCCESS',
          payload: { dressItems: outfitValue.data.dressItems.filter((x: any) => x[0] !== id) },
        });
      } catch (e) {
        console.log("DressChooseScreen.handleChooseBtnPress", e);
        dispatchOutfitValue({ type: 'VALUE_UPDATE_FAILURE' })
      }
    } else {
      dispatchOutfitValue({ type: 'VALUE_UPDATE_INIT' });
      try {
        dispatchOutfitValue({
          type: 'VALUE_UPDATE_SUCCESS',
          payload: { dressItems: outfitValue.data.dressItems.concat([[id, name]]) },
        });
      } catch (e) {
        console.log("DressChooseScreen.handleChooseBtnPress", e);
        dispatchOutfitValue({ type: 'VALUE_UPDATE_FAILURE' })
      }
    }
  }

  const sortTypes = (a: any, b: any, sortAtt: string, ascending: boolean = false) => ascending ? b[sortAtt] - a[sortAtt] : a[sortAtt] - b[sortAtt]

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerContainer}>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "date" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("date") }}>
          <Text style={styles.smallText}>按使用时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "count" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("count") }}>
          <Text style={styles.smallText}>按使用次数</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { left: 0, paddingTop: 3, backgroundColor: sortAtt === "buyDate" ? "#aaa" : "#fff" }]} onPress={() => { setSortAtt("buyDate") }}>
          <Text style={styles.smallText}>按购买时间</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, { right: 8, position: 'absolute', width: 24 }]} onPress={() => { setAscending(!ascending) }}>
          <MaterialCommunityIcons name={ascending ? "arrow-up" : "arrow-down"} size={22} color="#aaa" />
        </Pressable>
      </View>
      <View style={styles.container}>
        {values.data.sort((a: any, b: any) => sortTypes(a, b, sortAtt, ascending)).map((data: { uri: string; id: string; date: number; name: string; }) => (
          <Card choose={outfitValue.data.dressItems.flat().includes(data.id)} type="choose" uri={data.uri} key={data.id} id={data.id} name={data.name} onChooseBtnPress={handleChooseBtnPress} date={data.date} />
        ))}
      </View>
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

