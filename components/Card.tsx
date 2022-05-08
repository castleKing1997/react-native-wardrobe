import { useLinkProps } from '@react-navigation/native';
import React, {Component} from 'react';
import {
     Dimensions,
     View,
     Image,
     TouchableWithoutFeedback,
     TouchableOpacity,
     StyleSheet,
     Text,
     ImageBackground,
     Button,
     Pressable,
     GestureResponderEvent,
 } from 'react-native';
 
const {width, height} = Dimensions.get('window');

const getTimer = (lastEditTime: number) => {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var month = day * 30;
    var curTime = new Date().getTime();//当前的时间戳
    var time = curTime - lastEditTime;
    var result = null;
    if (time < 0) {
        alert("设置的时间不能早于当前时间！");
    } else if (time / month >= 1) {
        result = "发布于：" + Math.floor(time / month) + "月前";
    } else if (time / week >= 1) {
        result = "发布于：" + Math.floor(time / week) + "周前";
    } else if (time / day >= 1) {
        result = "发布于：" + Math.floor(time / day) + "天前";
    } else if (time / hour >= 1) {
        result = "发布于：" + Math.floor(time / hour) + "小时前";
    } else if (time / minute >= 1) {
        result = "发布于：" + Math.floor(time / minute) + "分钟前";
    } else {
        result = "刚刚发布！";
    }
    return result;
}
 
export default function Card(props: { uri: any; onLeftBtnPress: ((event: GestureResponderEvent) => void) | null | undefined; onRightBtnPress: ((event: GestureResponderEvent) => void) | null | undefined; date:number}){
    return(
            <View style={styles.cardContainer}>
                <ImageBackground  source={{uri: props.uri}} style={styles.cardBackGround} imageStyle={styles.cardBackGroundImage} resizeMode="cover" />
                <Text style={styles.text}>{getTimer(props.date)}</Text>
                <View style={styles.cardBottomBackground}>
                    <Pressable style={styles.cardBtn} onPress={props.onLeftBtnPress}>
                        <Text style={styles.textBtn}>今天穿</Text>
                    </Pressable>
                    <Pressable style={styles.cardBtn} onPress={props.onRightBtnPress}>
                        <Text style={styles.textBtn}>去搭配</Text>
                    </Pressable>
                </View>
            </View>
    );
}

Card.defaultProps = {
    uri: 'https://reactnative.dev/img/tiny_logo.png',
    key: '0',
    onLeftBtnPress: (e: any)=>{console.log(e)},
    onRightBtnPress: (e: any)=>{console.log(e)},
    date: 0,
}

const styles = StyleSheet.create({
    cardContainer: {
        width: width/2-16,
        height: height/3,
        borderRadius: 20,
        margin: 4,
    },
    cardBottomBackground: {
        bottom: 0,
        width: '100%',
        height: 47,
        backgroundColor:"#dacdb777",
        position: 'absolute',
        flexDirection: 'row',
    },
    cardBackGround: {
        width: '100%',
        height: '100%',
    },
    cardBackGroundImage: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardBtn: {
        width: "48%",
        height: 43,
        backgroundColor: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        opacity: 0.5,
        margin: 2,
    },
    textBtn: {
        color: "#000",
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        color: "#000",
        fontSize: 16,
        marginLeft: 10,
        marginVertical: 5,
    }
})