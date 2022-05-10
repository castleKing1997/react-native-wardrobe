import { ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import React, { useEffect, useReducer } from 'react';
import { View } from '../components/Themed';
import Storage from '../manage/Storage';

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
    console.log("WardrobeSceen.getDressData", e);
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

export default function WardrobeScreen(props: any) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false }
  );

  const readItemsFromStorage = async () => {
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getDressData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch (e) {
      console.log("WardrobeScreen.readItemsFromStorage", e);
      dispatchValues({ type: 'VALUES_FETCH_FAILURE' })
    }
  };

  const removeItemFromStorage = async (key: string) => {
    try {
      await Storage.removeMyObject(key);
      readItemsFromStorage();
    } catch (e) {
      console.log("WardrobeScreen.removeItemFromStorage", e);
    }
  }

  const writeItemToStorage = async (item: any) => {
    try {
      const id = "@DRESS_" + item.id;
      await Storage.setObjectValue(id, item);
      readItemsFromStorage();
    } catch (e) {
      console.log("WardrobeScreen.writeItemToStorage", e);
    }
  };

  useEffect(() => {
    readItemsFromStorage();
    Storage.updateData = () => readItemsFromStorage();
  }, []);

  const handleLeftBtnPress = (item: any) => {
    item.date = new Date().getTime();
    item.dressCount += 1;
    writeItemToStorage(item);
  }

  const handleDeleteBtnPress = (id: string) => {
    const key = "@DRESS_" + id;
    removeItemFromStorage(key);
  }

  const handleCardPress = (id: string) => {
    props.navigation.navigate("DressDetail", { id: id });
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {values.data.sort((a: { date: number }, b: { date: number }) => a.date - b.date).map((data: { uri: string; id: string; date: number; }) => (
          <Card uri={data.uri} key={data.id} onLeftBtnPress={() => handleLeftBtnPress(data)} onDeleteBtnPress={() => handleDeleteBtnPress(data.id)} onCardPress={() => handleCardPress(data.id)} date={data.date} />
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

