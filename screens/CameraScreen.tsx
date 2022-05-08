import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, BackHandler } from 'react-native';
import { Camera } from 'expo-camera';
import Storage from '../manage/Storage';
import { CapturedPicture } from 'expo-camera/build/Camera.types';

const getUUid = () => {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-'; 
  return s.join('');
}

export default function CameraScreen(props: { navigation: { goBack: () => void; }; }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState<Camera|null>(null);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  // console.log("CameraScreen.render", props)
  // BackHandler.addEventListener("hardwareBackPress", () => {console.log("CameraScreen back")});
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(ref:Camera) => {setCamera(ref);}}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log("CameraScreen.Take")
              // console.log("Camera", camera)
              camera?.takePictureAsync().then((data:CapturedPicture) => {
                console.log("CameraScreen.takePictureAsync",data);
                const id = getUUid();
                const now = new Date().getTime();
                const dressData = {
                  id: id,
                  uri: data.uri,
                  date: now,
                }
                Storage.setObjectValue("@DRESS_"+id, dressData);
                console.log("CameraScreen.Take", data);
              }).then(
                () => {
                  Storage.updateData();
                  console.log("CameraScreen.Save");
                }
              ).catch(
                e => {
                  console.log("err");
                  console.log(e);
                }
              );
              props.navigation.goBack();
            }}>
            <Text style={styles.text}> Take </Text>
          </TouchableOpacity>
        </View>
      </Camera>
      {/* <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      margin: 20,
    },
    button: {
      flex: 0.2,
      margin: 10,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });