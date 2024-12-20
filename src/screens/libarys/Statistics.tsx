import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import { Section } from '@bsdaoquang/rncomponent';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Statistics = ({ navigation }: any) => {
    const [listeningHistory, setListeningHistory] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    const fetchStatistics = async () => {
        const userId = auth().currentUser?.uid;
        if (userId) {
            try {
                const listeningRef = firestore()
                    .collection('listeningHistory')
                    .doc(userId);

                const listeningDoc = await listeningRef.get();
                if (listeningDoc.exists) {
                    setListeningHistory(listeningDoc.data()?.history || []);
                }

                const searchRef = firestore()
                    .collection('searchHistory')
                    .doc(userId);

                const searchDoc = await searchRef.get();
                if (searchDoc.exists) {
                    setSearchHistory(searchDoc.data()?.history || []);
                }
            } catch (error) {
                console.log('Error fetching statistics:', error);
            }
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const renderListeningItem = ({ item }: any) => (
        <View style={styles.historyItem}>
            <TextComponent
                text={`Ngày: ${item.date}`}
                font={fontFamilies.semiBold}
                size={18}
            />
            <TextComponent
                text={`Thời gian nghe: ${item.duration} phút`}
                font={fontFamilies.regular}
                size={16}
            />
        </View>
    );

    const renderSearchItem = ({ item }: any) => (
        <View style={styles.historyItem}>
            <TextComponent
                text={`Tìm kiếm: ${item.query}`}
                font={fontFamilies.semiBold}
                size={18}
            />
            <TextComponent
                text={`Thời gian: ${item.timestamp}`}
                font={fontFamilies.regular}
                size={16}
            />
        </View>
    );

    return (
        <Container isScroll={false} style={{ backgroundColor: colors.white, flex: 1 }}>
            <Section styles={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 15,
                backgroundColor: colors.instagram,
            }}>
                <TouchableOpacity style={{
                    position: 'absolute',
                    left: 0,
                    padding: 15,
                }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={40}
                        color={colors.white}
                    />
                </TouchableOpacity>
                <TextComponent
                    text="Thống kê"
                    font={fontFamilies.bold}
                    size={30}
                    color={colors.white}
                />
            </Section>

            <TextComponent
                text="Thời gian nghe nhạc"
                font={fontFamilies.semiBold}
                size={20}
                styles={styles.sectionTitle}
            />
            <FlatList
                data={listeningHistory}
                keyExtractor={(item, index) => `listening-${index}`}
                renderItem={renderListeningItem}
                contentContainerStyle={styles.listContainer}
            />

            <TextComponent
                text="Lịch sử tìm kiếm"
                font={fontFamilies.semiBold}
                size={20}
                styles={styles.sectionTitle}
            />
            <FlatList
                data={searchHistory}
                keyExtractor={(item, index) => `search-${index}`}
                renderItem={renderSearchItem}
                contentContainerStyle={styles.listContainer}
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        marginVertical: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    historyItem: {
        padding: 10,
        backgroundColor: colors.grey,
        marginBottom: 10,
        borderRadius: 10,
    },
});

export default Statistics;
