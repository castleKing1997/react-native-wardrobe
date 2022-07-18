import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, TextInput } from 'react-native';
import axios from 'axios'
import { Text, View } from '../components/Themed';
import { clearAllData, clearDressData, clearOutfitData, getAllDataAndKeys, getDressData, getOutfitData } from '../utils/DataUtils';
import AWS, { S3 } from "aws-sdk";
import Storage from '../manage/Storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import * as FileSystem from 'expo-file-system';


export default function UserScreen(props: any) {
  const [userName, setUserName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState(false);
  const [minioClient, setMinioClient] = useState<S3>(new AWS.S3());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("上传");
  const [state, setState] = useState("空闲");
  const [stateMsg, setStageMsg] = useState("");

  const connectMinio = async () => {
    // create the client
    var s3 = new AWS.S3({
      accessKeyId: "3BSRkoFduBJpsCrt",
      secretAccessKey: secretKey,
      endpoint: "https://3405y5z372.goho.co",
      s3ForcePathStyle: true,
      signatureVersion: "v4"
    });
    setMinioClient(s3);
  };

  useEffect(() => {
    connectMinio();
  }, [secretKey]);

  const upload = async () => {
    setDialogVisible(false);
    setState("上传中……")
    try {
      const items = await getAllDataAndKeys();
      await doUpload(items, userName);
    } catch {
      setError(true);
    }
    console.log("关闭窗口")
  }

  const download = async () => {
    setDialogVisible(false);
    setState("下载中……")
    try {
      await doDownload(userName);
    } catch {
      setError(true);
    }
    console.log("关闭窗口")
  }

  const doDownload = async (key: any) => {
    // 下载keys
    let flag = true;
    const params = {
      Bucket: "dress-online",
      Key: key
    };
    setStageMsg("【下载键文件】")
    minioClient.getObject(params, async function (err, data) {
      if (err) {
        setStageMsg("【下载键文件出错】+" + err)
        setState("下载出错")
        setError(true);
        flag = false;
      } else {
        await clearAllData();
        setStageMsg("【解码键文件】")
        const data_ = eval("(" + data.Body?.toString() + ")");
        if (data_.length === 0) {
          setStageMsg("【下载完成】");
          setState("下载完成");
          setError(false);
          Storage.updateDressData();
          Storage.updateOutfitData();
        }
        setStageMsg("【下载数据包】")
        for (let index = 0; index < data_.length; index++) {
          if (!flag) {
            break;
          }
          const key = data_[index];
          const params = {
            Bucket: "dress-online",
            Key: key
          };
          setStageMsg("【下载数据包】下载" + key);
          minioClient.getObject(params, async function (err, data) {
            if (err) {
              setStageMsg("【下载数据包出错】+" + err)
              setState("下载出错")
              setError(true);
              flag = false;
            } else {
              const element = eval("(" + data.Body?.toString() + ")");
              try {
                let item = JSON.parse(element[1]);
                if (item.hasOwnProperty("uri")) {
                  if (item?.uri.match("base64")) {
                    setStageMsg("【解码数据包】解码" + element[0]);
                    const savePath = FileSystem.documentDirectory + item.id + ".png";
                    await FileSystem.writeAsStringAsync(savePath, item?.uri.split("base64,")[1], {
                      encoding: "base64",
                    });
                    item.uri = savePath;
                    element[1] = JSON.stringify(item);
                  }
                }
                setStageMsg("【解码数据包】读入" + element[0]);
                await Storage.setObjectValue(element[0], JSON.parse(element[1]));
                if (element[0] === data_[data_.length - 1]) {
                  setStageMsg("【下载完成】");
                  setState("下载完成");
                  setError(false);
                  Storage.updateDressData();
                  Storage.updateOutfitData();
                }
              } catch {
                setStageMsg("【解码数据包】读入" + element[0]);
                await Storage.setObjectValue(element[0], element[1]);
                if (element[0] === data_[data_.length - 1]) {
                  setStageMsg("【下载完成】");
                  setState("下载完成");
                  setError(false);
                  Storage.updateDressData();
                  Storage.updateOutfitData();
                }
              }
            }
          });
        }
      }
    });
  }

  const doUpload = async (items: any, key: any) => {
    setStageMsg("【数据打包】")
    let flag = true;
    const keys = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      keys.push(element[0]);
      try {
        let item = JSON.parse(element[1]);
        if (item.hasOwnProperty("uri")) {
          if (!item?.uri.match("base64")) {
            setStageMsg("【数据打包】编码" + element[0]);
            const fsRead = await FileSystem.readAsStringAsync(item?.uri, {
              encoding: "base64",
            });
            item.uri = `base64,${fsRead}`;
            element[1] = JSON.stringify(item);
          }
        }
      } catch (e) {
        setStageMsg("【打包失败】" + e);
      }
    }
    setStageMsg("【上传数据包】");
    // 上传keys
    const params = {
      Body: JSON.stringify(keys),
      Bucket: "dress-online",
      Key: key
    };
    setStageMsg("【上传数据包】上传键");
    minioClient.putObject(params, function (err, data) {
      if (err) {
        setStageMsg("【上传数据包失败】" + err);
        setState("上传出错")
        setError(true);
        flag = false;
      }
    });
    for (let index = 0; index < keys.length; index++) {
      if (!flag) {
        break;
      }
      const key = keys[index];
      const element = items[index];
      const params = {
        Body: JSON.stringify(element),
        Bucket: "dress-online",
        Key: key
      };
      setStageMsg("【上传数据包】上传" + key);
      minioClient.putObject(params, function (err, data) {
        if (err) {
          setStageMsg("【上传数据包失败】" + err);
          setState("上传出错")
          setError(true);
          flag = false;
        }
      });
    }
    if (flag) {
      setStageMsg("【上传数据包成功】");
      setState("上传完成")
      setError(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ color: 'green', fontSize: 18, marginBottom: 10 }}>{state}</Text>
      <Text style={{ fontSize: 14, marginBottom: 5 }}>{stateMsg}</Text>
      <TextInput
        value={userName || ""}
        onChangeText={(x) => { setUserName(x) }}
        placeholder={'用户名'}
        style={styles.input}
      />
      <TextInput
        value={secretKey || ""}
        onChangeText={(x) => { setSecretKey(x) }}
        placeholder={'密钥'}
        style={styles.input}
      />
      <Pressable style={styles.submitBtn} onPress={() => { setDialogTitle("上传"); setDialogVisible(true); }}>
        <Text style={{ fontSize: 16 }}>上传数据</Text>
      </Pressable>
      <Pressable style={styles.submitBtn} onPress={() => { setDialogTitle("下载"); setDialogVisible(true); }}>
        <Text style={{ fontSize: 16 }}>下载数据</Text>
      </Pressable>
      {error && <Text style={{ color: 'red' }}>服务器连接失败</Text>}
      <AwesomeAlert
        show={dialogVisible}
        showProgress={false}
        title={"确认" + dialogTitle}
        message={"是否“" + dialogTitle + "”？"}
        closeOnTouchOutside={true}
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
          } else if (dialogTitle === "下载") {
            download();
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
