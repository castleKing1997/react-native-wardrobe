import { useEffect, useReducer, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, ImageBackground, View, Text } from 'react-native';
import Storage from '../manage/Storage';
import { formatDate, getTimer } from '../utils/TimeUtils';

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

export default function OutfitDetailScreen(props: any) {
  const id = props.route.params.id;
  const key = "@OUTFIT_" + id;
  const [value, dispatchValue] = useReducer(
    valueReducer,
    { data: null, isLoading: false, isError: false }
  );

  const readItemFromStorage = async () => {
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

  useEffect(() => { readItemFromStorage() }, [])

  let date = null;
  if (value.data) {
    date = (new Date(value.data?.date)).toLocaleDateString()
  } else {
    date = (new Date()).toLocaleDateString()
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.topContainer}>
        <ImageBackground style={styles.OutfitImage} source={{ uri: value.data?.uri }} resizeMode="cover" />
      </View>
      <View style={[styles.container, { flexDirection: "row", flexWrap: "wrap", }]}>
        {value.data?.dressItems.map((dress: any) => (
          <Pressable key={dress[0]} style={[styles.dressBtn, { paddingTop: 3 }]} onPress={() => { props.navigation.navigate("DressDetail", { id: dress[0] }) }}>
            <Text style={styles.smallText}>{dress[1]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>{value.data ? (value.data.name ? value.data.name : "我的小套装") : "我的小套装"}</Text>
        <Text style={styles.text}>上次穿：{formatDate(date)}</Text>
        <Text style={styles.text}>穿过：{value.data ? value.data.OutfitCount : 0}次</Text>
        <Text style={styles.text}>创建时间：{value.data ? getTimer(value.data.createDate, "刚刚创建！") : "刚刚入手！"}</Text>
      </View>
    </ScrollView>
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
    backgroundColor: '#fff',
    marginTop: 5,
    marginHorizontal: 5,
    paddingTop: 5,
  },
  dressBtn: {
    height: 24,
    paddingHorizontal: 5,
    marginHorizontal: 4,
    marginBottom: 4,
    backgroundColor: "#cab",
    borderRadius: 8,
    alignItems: 'center',
    alignContent: 'center',
  },
  OutfitImage: {
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
  smallText: {
    fontSize: 12,
  },
});
