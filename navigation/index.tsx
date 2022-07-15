/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import NotFoundScreen from '../screens/NotFoundScreen';
import DressScreen from '../screens/DressScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import Storage from '../manage/Storage';
import DressDetailScreen from '../screens/DressDetailScreen';
import DressEditScreen from '../screens/DressEditScreen';
import OutfitScreen from '../screens/OutfitScreen';
import OutfitEditScreen from '../screens/OutfitEditScree';
import OutfitDetailScreen from '../screens/OutfitDetailScreen';
import DressChooseScreen from '../screens/DressChooseScreen';
import UserScreen from '../screens/UserScreen';
import * as FileSystem from 'expo-file-system';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}


const getUUid = () => {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits[Math.floor(Math.random() * 0x10)];
  }
  s[14] = '4';
  if (s[19] >= 'a' && s[19] <= 'f') {
    s[19] = hexDigits[8];
  } else {
    s[19] = hexDigits[parseInt(s[19]) & 0x3];
  }
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}

const openImagePickerAsync = async (navigation: any, type: string) => {
  let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    alert('Permission to access camera roll is required!');
    return;
  }
  let pickerResult = await ImagePicker.launchImageLibraryAsync({ base64: true });
  if (pickerResult.cancelled === true) {
    return;
  }
  const id = getUUid();
  let uri = pickerResult.uri;
  if (!uri.match("base64")) {
    const fsRead = await FileSystem.readAsStringAsync(pickerResult.uri, {
      encoding: "base64",
    });
    uri = `data:image/png;base64,${fsRead}`;
  }
  if (type === "dress") {
    const dressData = {
      id: id,
      uri: uri,
      dressCount: 0,
    }
    await Storage.setObjectValue("@DRESS_" + id, dressData);
    navigation.navigate("DressEdit", { id: id, type: "set" });
  } else if (type == "outfit") {
    const outfitData = {
      id: id,
      uri: uri,
      dressItems: [],
      outfitCount: 0,
    }
    await Storage.setObjectValue("@OUTFIT_" + id, outfitData);
    navigation.navigate("OutfitEdit", { id: id, type: "set" });
  }

};

const handleEditItem = (navigation: any, type: string) => {
  const id = navigation.route.params.id;
  if (type === "dress") {
    navigation.navigation.navigate("DressEdit", { id: id, type: "update" });
  } else if (type === "outfit") {
    navigation.navigation.navigate("OutfitEdit", { id: id, type: "update" });
  }
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();



function RootNavigator() {
  const colorScheme = useColorScheme();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="DressDetail"
          component={DressDetailScreen}
          options={(navigation) => ({
            "title": "单品详情",
            headerRight: () => (<Pressable
              onPress={() => {
                handleEditItem(navigation, "dress")
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="edit"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>)
          })} />
        <Stack.Screen
          name="OutfitDetail"
          component={OutfitDetailScreen}
          options={(navigation) => ({
            "title": "穿搭详情",
            headerRight: () => (<Pressable
              onPress={() => {
                handleEditItem(navigation, "outfit")
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="edit"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>)
          })} />
        <Stack.Screen
          name="DressChoose"
          component={DressChooseScreen}
          options={() => ({
            "title": "单品选择",
            headerRight: () => (<Pressable
              onPress={() => {
                Storage.chooseDress();
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="check"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>)
          })} />
        <Stack.Screen name="DressEdit" component={DressEditScreen} options={() => ({ "title": "单品编辑", headerLeft: () => (<React.Fragment></React.Fragment>) })} />
        <Stack.Screen name="OutfitEdit" component={OutfitEditScreen} options={() => ({ "title": "穿搭编辑", headerLeft: () => (<React.Fragment></React.Fragment>) })} />
      </Stack.Group>
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Dress"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="Dress"
        component={DressScreen}
        options={({ navigation }: RootTabScreenProps<'Dress'>) => ({
          title: '衣柜',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => {
                openImagePickerAsync(navigation, "dress")
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="plus"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="Outfit"
        component={OutfitScreen}
        options={({ navigation }: RootTabScreenProps<'Outfit'>) => ({
          title: '穿搭',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="flower" size={28} color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => {
                openImagePickerAsync(navigation, "outfit")
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="plus"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="User"
        component={UserScreen}
        options={({ navigation }: RootTabScreenProps<'User'>) => ({
          title: '我',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="human" size={28} color={color} />,
        })}
      />
    </BottomTab.Navigator>
  );
}

