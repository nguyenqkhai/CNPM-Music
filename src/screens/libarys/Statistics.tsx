import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Comment = {
    id: string;
    content: string;
    timestamp: string;
};

type RecentlySong = {
    id: string;
    name: string;
    artists: string[];
    image: string;
    videoUrl: string;
    genres: string[];
};

const Statistics = ({ navigation }: any) => {
    const [totalListeningTime, setTotalListeningTime] = useState(0);
    const [mostListenedSong, setMostListenedSong] = useState('');
    const [userComments, setUserComments] = useState<Comment[]>([]);

    const fetchTotalListeningTime = async () => {
        console.log("Lưu ý: Thời gian nghe không được lưu trong bảng 'recently list'. Hãy thêm thuộc tính 'duration' nếu cần.");
        return 0; // Trả về 0 hoặc loại bỏ hoàn toàn nếu không lưu duration.
    };

    const fetchMostListenedSong = async () => {
        const userId = auth().currentUser?.uid;
        if (userId) {
            const userRef = firestore().collection('recently list').doc(userId);
            const snapshot = await userRef.get();

            if (snapshot.exists) {
                const recentlyData = snapshot.data() as { [key: string]: RecentlySong };
                if (!recentlyData) return 'Không có dữ liệu';

                // Tạo một đối tượng đếm số lần nghe mỗi bài hát
                const songCounts: { [key: string]: number } = {};

                Object.keys(recentlyData).forEach(songId => {
                    songCounts[songId] = (songCounts[songId] || 0) + 1;
                });

                // Xác định bài hát được nghe nhiều nhất
                const mostListenedSongId = Object.keys(songCounts).reduce((a, b) =>
                    songCounts[a] > songCounts[b] ? a : b
                );

                const mostListenedSong = recentlyData[mostListenedSongId];
                return mostListenedSong?.name || 'Không có dữ liệu';
            }
        }
        return 'Không có dữ liệu';
    };

    const fetchUserComments = async () => {
        const userId = auth().currentUser?.uid;
        if (userId) {
            const commentRef = firestore()
                .collection('comment')
                .where('userId', '==', userId);

            const snapshot = await commentRef.get();
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                content: doc.data().content,
                timestamp: doc.data().timestamp,
            }));

            return comments;
        }
        return [];
    };

    useEffect(() => {
        const fetchData = async () => {
            const time = await fetchTotalListeningTime();
            const song = await fetchMostListenedSong();
            const comments = await fetchUserComments();

            setTotalListeningTime(time);
            setMostListenedSong(song);
            setUserComments(comments);
        };

        fetchData();
    }, []);

    return (
        <Container isScroll={false} style={{ backgroundColor: colors.white, flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons
                    name="chevron-back"
                    size={40}
                    color={colors.white}
                    onPress={() => navigation.goBack()}
                />
                <TextComponent
                    text="Thống kê"
                    font={fontFamilies.bold}
                    size={30}
                    color={colors.white}
                    styles={{ textAlign: 'center', flex: 1 }}
                />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Tổng thời gian nghe nhạc */}
                <TextComponent
                    text={`Tổng thời gian nghe nhạc: ${totalListeningTime} phút`}
                    font={fontFamilies.semiBold}
                    size={20}
                    styles={styles.section}
                />

                {/* Bài hát nghe nhiều nhất */}
                <TextComponent
                    text={`Bài hát nghe nhiều nhất: ${mostListenedSong}`}
                    font={fontFamilies.semiBold}
                    size={20}
                    styles={styles.section}
                />

                {/* Danh sách bình luận */}
                <TextComponent
                    text="Danh sách bình luận của bạn:"
                    font={fontFamilies.semiBold}
                    size={20}
                    styles={styles.sectionTitle}
                />
                {userComments.map(comment => (
                    <View key={comment.id} style={styles.commentItem}>
                        <TextComponent
                            text={`Nội dung: ${comment.content}`}
                            font={fontFamilies.regular}
                            size={16}
                        />
                        <TextComponent
                            text={`Thời gian: ${comment.timestamp}`}
                            font={fontFamilies.regular}
                            size={14}
                        />
                    </View>
                ))}
            </ScrollView>
        </Container>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.instagram,
    },
    container: {
        padding: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        marginVertical: 16,
    },
    commentItem: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: colors.grey,
        borderRadius: 8,
    },
});

export default Statistics;
