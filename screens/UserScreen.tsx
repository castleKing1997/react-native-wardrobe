import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, TextInput } from 'react-native';
import axios from 'axios'
import { Text, View } from '../components/Themed';
import { clearAllData, clearDressData, clearOutfitData, getAllDataAndKeys, getDressData } from '../utils/DataUtils';
import AWS, { S3 } from "aws-sdk";
import Storage from '../manage/Storage';
import AwesomeAlert from 'react-native-awesome-alerts';


export default function UserScreen(props: any) {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(false);
  const [minioClient, setMinioClient] = useState<null | S3>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("上传");

  useEffect(() => {
    const connectMinio = async () => {
      // create the client
      var s3 = new AWS.S3({
        accessKeyId: "3BSRkoFduBJpsCrt",
        secretAccessKey: "0RUlfQ5zn8yxBtB1KBkULF4wjISznwud",
        endpoint: "https://3405y5z372.goho.co",
        s3ForcePathStyle: true,
        signatureVersion: "v4"
      });
      setMinioClient(s3);
    };
    connectMinio();
  }, []);

  const upload = async () => {
    const items = await getAllDataAndKeys();
    doUpload(items, userName);
  }

  const download = async () => {
    // clearAllData();
    doDownload(userName);
  }

  const doDownload = (key: any) => {
    const params = {
      Bucket: "dress-online",
      Key: key
    };
    minioClient?.getObject(params, async function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        const data_ = eval("(" + data.Body?.toString() + ")");
        data_?.forEach(async (element: any) => {
          try {
            await Storage.setObjectValue(element[0], JSON.parse(element[1]));
          } catch {
            await Storage.setObjectValue(element[0], element[1]);
          }
        })
      }
      Storage.updateDressData();
      Storage.updateOutfitData();
    });
  }

  const doUpload = (items: any, key: any) => {
    const data = JSON.stringify(items);
    const params = {
      Body: data,
      Bucket: "dress-online",
      Key: key
    };
    minioClient?.putObject(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data);           // successful response
    });
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={userName || ""}
        onChangeText={(x) => { setUserName(x) }}
        placeholder={'用户名'}
        style={styles.input}
      />
      <Pressable style={styles.submitBtn} onPress={() => { setDialogTitle("上传"); setDialogVisible(true); }}>
        <Text style={{ fontSize: 16 }}>上传数据</Text>
      </Pressable>
      <Pressable style={styles.submitBtn} onPress={() => { setDialogTitle("下载"); setDialogVisible(true); }}>
        <Text style={{ fontSize: 16 }}>下载数据</Text>
      </Pressable>
      {error && <Text style={{ color: 'red' }}>用户名或密码错误</Text>}
      <AwesomeAlert
        show={dialogVisible}
        showProgress={false}
        title={"确认" + dialogTitle}
        message={"是否“" + dialogTitle + "”？"}
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
          if (dialogTitle === "上传") {
            upload();
            setDialogVisible(false);
          } else if (dialogTitle === "下载") {
            download();
            setDialogVisible(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
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
});
