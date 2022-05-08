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
 
export default function Card(props: { uri: any; onLeftBtnPress: ((event: GestureResponderEvent) => void) | null | undefined; onRightBtnPress: ((event: GestureResponderEvent) => void) | null | undefined; }){
    return(
            <View style={styles.cardContainer}>
                <ImageBackground  source={{uri: props.uri}} style={styles.cardBackGround} imageStyle={styles.cardBackGroundImage} resizeMode="cover" />
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