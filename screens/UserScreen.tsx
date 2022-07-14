import { useState } from 'react';
import { StyleSheet, Pressable, TextInput } from 'react-native';
import axios from 'axios'
import { Text, View } from '../components/Themed';
import { clearDressData, clearOutfitData, getDressData } from '../utils/DataUtils';

const serverAddress = "https://3405y5z372.goho.co/";
var Minio = require('minio')

var minioClient = new Minio.Client({
  endPoint: 'https://3405y5z372.goho.co/',
  port: 443,
  useSSL: true,
  accessKey: '3BSRkoFduBJpsCrt',
  secretKey: '0RUlfQ5zn8yxBtB1KBkULF4wjISznwud'
});

var metaData = {
  'Content-Type': 'application/octet-stream',
  'X-Amz-Meta-Testing': 1234,
  'example': 5678
}

export default function UserScreen(props: any) {
  const [userName, setUserName] = useState("");
  const [passwd, setPasswd] = useState("");
  const [error, setError] = useState(false);

  const verifyUserInfo = () => {
    const url = serverAddress + "/user/query?userName=" + userName;
    axios
      .get(url)
      .then(result => {
        const data = result.data.data;
        const passwd_ = data.passwd;
        if (passwd_ === passwd) {
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
  }
  const download = async () => {
    clearDressData();
    clearOutfitData();
  }

  const upload = async () => {
    const url = serverAddress + "/user/query?userName=" + userName;
    let flag = false;
    axios
      .get(url)
      .then(async result => {
        const data = result.data.data;
        const passwd_ = data.passwd;
        const userId_ = data.id;
        if (passwd_ === passwd) {
          setError(false);
          const items = await getDressData();
          doUpload(items, userId_);
        } else {
          setError(true);
        }
      })
      .catch((e) => {
        console.log(e);
        setError(true);
      })
  }

  const doUpload = (items: any, userId: any) => {
    const url = serverAddress + "/dress/create"
    items.forEach((element: any) => {
      console.log(element);
      // minioClient.fPutObject('dress-online', 'photos-europe.tar', element.uri, metaData, function (err: any, etag: any) {
      //   if (err) return console.log(err)
      //   console.log('File uploaded successfully.')
      // });
      axios
        .post(url, {
          "buydate": element.buyDate,
          "date": element.date,
          "dresscount": element.dressCount,
          "dressid": element.id,
          "name": element.name,
          "uri": element.uri,
          "userid": userId
        })
        .catch((e) => {
          console.log(e);
        })
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
      <TextInput
        value={passwd || ""}
        onChangeText={(x) => { setPasswd(x) }}
        placeholder={'密码'}
        style={styles.input}
        secureTextEntry={true}
      />
      <Pressable style={styles.submitBtn} onPress={upload}>
        <Text style={{ fontSize: 16 }}>上传数据</Text>
      </Pressable>
      <Pressable style={styles.submitBtn} onPress={download}>
        <Text style={{ fontSize: 16 }}>下载数据</Text>
      </Pressable>
      {error && <Text style={{ color: 'red' }}>用户名或密码错误</Text>}
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
