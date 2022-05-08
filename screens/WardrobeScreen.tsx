import { ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import React, { useEffect, useReducer} from 'react';
import { View } from '../components/Themed';
import Storage from '../manage/Storage';

const getDressData = async () => {
  const items: any[] = []
  try {
    const keys = await Storage.getAllKeys();
    const matchedKey = Storage.matchKey(keys, "@DRESS_*");
    const dressData = await Storage.getMultiple(matchedKey);
    dressData?.forEach(element => {
      // console.log("TabTowScreen.getDressData", element);
      if(element[1]) {
        items.push(JSON.parse(element[1]));
      }
    });
  } catch(e) {
    console.log("WardrobeSceen.getDressData", e);
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
  case 'REMOVE_VALUE':
    return {
      ...state,
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

export default function WardrobeScreen(props: any) {
  const [values, dispatchValues] = useReducer(
    valuesReducer,
    { data: [], isLoading: false, isError: false, isUpdating: false}
  );

  const readItemsFromStorage = async () => {
    // console.log("WardrobeScreen.readItemsFromStorage")
    dispatchValues({ type: 'VALUES_FETCH_INIT' });
    try {
      let items = await getDressData();
      dispatchValues({
        type: 'VALUES_FETCH_SUCCESS',
        payload: items,
      });
    } catch(e) {
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
    // dispatchValues({ type: 'UPDATE_VALUE_INIT' });
    // console.log("WardrobeScreen.writeItemToStorage",item)
    try {
      const id = "@DRESS_"+item.id;
      await Storage.setObjectValue(id, item);
      readItemsFromStorage();
      // dispatchValues({
      //   type: 'UPDATE_VALUE_SUCCESS',
      // });
    } catch(e) {
      console.log("WardrobeScreen.writeItemToStorage", e);
      dispatchValues({ type: 'UPDATE_VALUE_FAILURE' })
    }
  };

  useEffect(() => {
    readItemsFromStorage();
    Storage.updateData = () => readItemsFromStorage();
    // console.log("WardrobeScreen.init", props);
    // console.log(props.navigate.route.params)
  }, []);

  const handleLeftBtnPress = (item: any) => {
    // console.log("WardrobeScreen.handleLeftBtnPress", item);
    item.date = new Date().getTime();
    writeItemToStorage(item);
  }

  const handleDeleteBtnPress = (id: string) => {
    const key = "@DRESS_"+id;
    removeItemFromStorage(key);
  }
  
  // console.log("WardrobeSceen", values);
  return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {values.data.sort((a:{date:number},b:{date:number})=>a.date-b.date).map((data:{uri:string; id:string; date:number;}) => (
            <Card uri={data.uri} key={data.id} onLeftBtnPress={()=>handleLeftBtnPress(data)} onDeleteBtnPress={()=>handleDeleteBtnPress(data.id)} date={data.date}/>
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

