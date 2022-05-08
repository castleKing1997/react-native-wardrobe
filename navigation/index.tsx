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
import { ColorSchemeName, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import NotFoundScreen from '../screens/NotFoundScreen';
import WardrobeScreen from '../screens/WardrobeScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import Storage from '../manage/Storage';

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
  if(s[19]>='a' && s[19] <= 'f') {
    s[19] = hexDigits[8];
  } else {
    s[19] = hexDigits[parseInt(s[19]) & 0x3];
  }
  s[8] = s[13] = s[18] = s[23] = '-'; 
  return s.join('');
}

const openImagePickerAsync = async () => {
  let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    alert('Permission to access camera roll is required!');
    return;
  }

  let pickerResult = await ImagePicker.launchImageLibraryAsync();

  if (pickerResult.cancelled === true) {
    return;
  }

  const id = getUUid();
  const now = new Date().getTime();
  const dressData = {
    id: id,
    uri: pickerResult.uri,
    date: now,
  }
  await Storage.setObjectValue("@DRESS_"+id, dressData);
  Storage.updateData();
};

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
      initialRouteName="Wardrobe"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={({ navigation }: RootTabScreenProps<'Wardrobe'>) => ({
          title: '衣柜',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => {
                openImagePickerAsync()
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
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
