import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { getTimer } from '../utils/TimeUtils';

const { width, height } = Dimensions.get('window');

export default function Card(props: { isVisible: boolean; choose: boolean; id: string; onChooseBtnPress: ((id: string, name: string) => void); name: string; type: string; uri: string; onCardPress: ((event: GestureResponderEvent) => void); onLeftBtnPress: ((event: GestureResponderEvent) => void); onRightBtnPress: ((event: GestureResponderEvent) => void); onDeleteBtnPress: ((event: GestureResponderEvent) => void); date: number; onVisBtnPress: ((event: GestureResponderEvent) => void); }) {
    const [choose, setChoose] = useState(props.choose);
    return (
        <View style={styles.cardContainer}>
            <ImageBackground source={{ uri: props.uri }} style={styles.cardBackGround} imageStyle={styles.cardBackGroundImage} resizeMode="cover" />
            {props.type === "check" && <Pressable style={styles.pressArea} onPress={props.onCardPress}></Pressable>}
            {props.type === "check" && <Text style={[styles.text, { bottom: 47, right: 0 }]}>{getTimer(props.date, "刚刚穿过！")}</Text>}
            {props.type === "check" ?
                <>
                    <Pressable style={[styles.smallBtn, { top: 0, right: 20 }]} onPress={props.onVisBtnPress}>
                        <MaterialIcons name={props.isVisible ? "visibility" : "visibility-off"} size={18} color="black" />
                    </Pressable>
                    <Pressable style={[styles.smallBtn, { top: 0, right: 0 }]} onPress={props.onDeleteBtnPress}>
                        <MaterialCommunityIcons name="close" size={18} />
                    </Pressable></>
                :
                <Pressable style={[styles.smallBtn, { top: 0, right: 0 }]} onPress={() => { setChoose(!choose); props.onChooseBtnPress(props.id, props.name); }}>
                    <MaterialIcons name={choose ? "radio-button-checked" : "radio-button-unchecked"} size={20} />
                </Pressable>
            }
            {props.type === "check" &&
                <View style={styles.cardBottomBackground}>
                    <Pressable style={styles.cardBtn} onPress={props.onLeftBtnPress}>
                        <Text style={styles.btnText}>今天穿</Text>
                    </Pressable>
                    <Pressable style={styles.cardBtn} onPress={props.onRightBtnPress}>
                        <Text style={styles.btnText}>去搭配</Text>
                    </Pressable>
                </View>
            }
            {props.type !== "check" &&
                <View style={[styles.cardBottomBackground, { alignContent: 'center', alignItems: 'center', padding: 10 }]}>
                    <Text style={[styles.btnText, { fontWeight: 'normal' }]}>{props.name}</Text>
                </View>
            }

        </View>
    );
}

Card.defaultProps = {
    uri: 'https://reactnative.dev/img/tiny_logo.png',
    key: '0',
    id: '0',
    name: '我的小裙子',
    onLeftBtnPress: (e: any) => { console.log(e) },
    onRightBtnPress: (e: any) => { console.log(e) },
    onDeleteBtnPress: (e: any) => { console.log(e) },
    onCardPress: (e: any) => { console.log(e) },
    onChooseBtnPress: (id: string, name: string) => { console.log(id, name) },
    choose: false,
    date: 0,
    type: "check",
}

const styles = StyleSheet.create({
    cardContainer: {
        width: width / 2 - 16,
        height: height / 3,
        borderRadius: 20,
        margin: 4,
    },
    cardBottomBackground: {
        bottom: 0,
        width: '100%',
        height: 47,
        backgroundColor: "#dacdb777",
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
    pressArea: {
        width: '100%',
        height: '100%',
        color: '#f00',
        position: 'absolute',
    },
    smallBtn: {
        opacity: 0.8,
        color: "#f00",
        margin: 5,
        position: 'absolute',
    },
    btnText: {
        color: "#000",
        fontSize: 20,
        fontWeight: 'bold',
    },
    text: {
        color: "#234",
        fontSize: 16,
        margin: 2,
        position: 'absolute',
        backgroundColor: "#dacdb777",
    }
})