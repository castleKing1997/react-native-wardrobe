import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { View, Text } from '../components/Themed';
import Storage from '../manage/Storage';

export default function DressDetailScreen(props: any) {
    const id = props.route.params.id;
    return (
    <View style={styles.container}>
        <Text style={styles.title}>{id}</Text>
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
  });
  