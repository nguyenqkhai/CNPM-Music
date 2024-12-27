import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import Container from '../../components/Container';
import TextComponent from '../../components/TextComponent';

const Statistics = ({ navigation }: any) => {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetching comments from Firestore for the current user
    const fetchUserComments = async () => {
        try {
            const userId = auth().currentUser?.uid;

            if (userId) {
                const commentsRef = firestore().collection('comments');
                const commentsSnapshot = await commentsRef.get();

                const userComments: any[] = [];

                commentsSnapshot.forEach((doc: any) => {
                    const data = doc.data();
                    if (data.comments && Array.isArray(data.comments)) {
                        // Lọc các bình luận của user từ mảng comments
                        const userSpecificComments = data.comments.filter(
                            (comment: any) => comment.userId === userId
                        );
                        userComments.push(
                            ...userSpecificComments.map((comment: any) => ({
                                ...comment,
                                name: data.name, // Thêm videoId để hiển thị
                            }))
                        );
                    }
                });

                setComments(userComments);
            } else {
                console.log('No user is currently logged in.');
            }
        } catch (error) {
            console.error('Error fetching user comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserComments();
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
                {/* Danh sách bình luận của người dùng */}
                <TextComponent
                    text="Bình luận của bạn"
                    font={fontFamilies.semiBold}
                    size={20}
                    styles={styles.sectionTitle}
                />

                {loading ? (
                    <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                ) : comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <View key={index} style={styles.commentCard}>
                            <Text style={styles.videoTitle}>
                                Video: {comment.name || 'Không xác định'}
                            </Text>
                            {/* Nếu cần lấy tên bài hát từ videoId, gọi hàm fetchSongName */}
                            <Text style={styles.commentText}>
                                {comment.comment || 'Nội dung không hợp lệ'}
                            </Text>
                            <Text style={styles.commentTimestamp}>
                                {comment.timestamp?.seconds
                                    ? new Date(comment.timestamp.seconds * 1000).toLocaleString()
                                    : 'Thời gian không xác định'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noComments}>Bạn chưa có bình luận nào</Text>
                )}
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
    sectionTitle: {
        marginVertical: 16,
        fontSize: 20,
    },
    commentCard: {
        padding: 10,
        backgroundColor: colors.grey,
        borderRadius: 8,
        marginBottom: 10,
    },
    videoTitle: {
        fontSize: 14,
        fontFamily: fontFamilies.semiBold,
        color: colors.black,
        marginBottom: 5,
    },
    commentText: {
        fontSize: 16,
        fontFamily: fontFamilies.regular,
    },
    commentTimestamp: {
        fontSize: 12,
        fontFamily: fontFamilies.regular,
        color: colors.black,
        marginTop: 5,
    },
    noComments: {
        fontSize: 16,
        fontFamily: fontFamilies.regular,
        color: colors.black,
        marginTop: 10,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: fontFamilies.regular,
        color: colors.lightGray,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Statistics;
