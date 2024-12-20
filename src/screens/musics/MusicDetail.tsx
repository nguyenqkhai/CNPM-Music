import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YoutubeIframe from 'react-native-youtube-iframe';
import Container from '../../components/Container';
import { Row, Section, Space, Text } from '@bsdaoquang/rncomponent';
import { colors } from '../../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TextComponent from '../../components/TextComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { sizes } from '../../constants/sizes';
import { fontFamilies } from '../../constants/fontFamilies';
import Octicons from 'react-native-vector-icons/Octicons'
import Entypo from 'react-native-vector-icons/Entypo'
import RNFS from 'react-native-fs'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { Reviews } from 'constants/models';
import Toast from 'react-native-toast-message';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import { parseTime } from '../../utils/helper';
import Input from '../../components/InputComponent';

const MusicDetail = ({ route, navigation }: any) => {
  const { playlist, song } = route.params;
  const [currentIndex, setCurrentIndex] = useState(
    playlist.findIndex((item: any) => item.name === song.name) || 0,
  );
  const [currentSong, setCurrentSong] = useState(song);
  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef<any>(null);
  const playerRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const { width } = Dimensions.get('window');

  const user = auth().currentUser
  const musicName = currentSong?.name;

  useEffect(() => {
    if (currentIndex >= 0 && playlist[currentIndex]) {
      setCurrentSong(playlist[currentIndex]);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (showControls) {
      resetHideControlsTimer();
    }
  }, [showControls]);

  useEffect(() => {
    handleGetComments()
  }, [])

  const handleGetComments = () => {
    firestore()
      .collection('reviews')
      .where('name', '==', musicName)
      .onSnapshot((snapshot: any) => {
        const items = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(items);
      });
  };

  const handlePostComments = async () => {
    if (!newComment) {
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Vui lòng nhập bình luận của bạn',
      });
      return;
    }

    const commentData = {
      user: user?.displayName,
      userComments: newComment,
      userId: user?.uid,
      photoUrl: user?.photoURL ?? '',
      timestamp: new Date(),
    };

    if (reviews.length > 0) {
      await firestore()
        .doc(`reviews/${reviews[0].id}`)
        .update({
          comments: firestore.FieldValue.arrayUnion(commentData),
        });
    } else {
      await firestore()
        .collection('reviews')
        .add({
          name: musicName,
          comments: [commentData],
        });
    }
    setNewComment('');
  };

  const handleDeleteComment = async (index: number, reviews: Reviews) => {
    try {
      await firestore()
        .collection('reviews')
        .doc(reviews.id)
        .update({
          comments: firestore.FieldValue.arrayRemove(reviews.comments[index]),
        });
      Toast.show({
        type: 'success',
        text1: 'Thông báo',
        text2: 'Xóa bình luận thành công',
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Xóa bình luận thất bại',
      });
    }
  };
  const resetHideControlsTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
  };

  const handlePressScreen = () => {
    setShowControls(prevState => !prevState);
    if (!showControls) {
      resetHideControlsTimer();
    }
  };

  const saveTofavorite = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Thông báo', 'Bạn cần đăng nhập để sử dụng chức năng này.');
        return;
      }

      const songId = String(currentSong.id); // ID của bài hát
      const userfavoriteRef = firestore().collection('favorite').doc(userId);

      const userfavoriteDoc = await userfavoriteRef.get();
      const favoriteData = userfavoriteDoc.exists ? userfavoriteDoc.data() : {};

      const isCurrentlyFavorite = favoriteData && favoriteData[songId];

      if (isCurrentlyFavorite) {
        await userfavoriteRef.update({
          [songId]: firestore.FieldValue.delete(),
        });
        setIsFavorite(false);
        Alert.alert('Thông báo', 'Bài hát đã được xóa khỏi danh sách yêu thích.');
      } else {
        await userfavoriteRef.set(
          {
            [songId]: {
              name: currentSong.name || 'Unknown',
              artists: currentSong.artists || 'Unknown',
              image: currentSong.image || '',
              videoUrl: currentSong.videoUrl || '',
              genres: Array.isArray(currentSong.genres) && currentSong.genres.length > 0
                ? currentSong.genres
                : ['Chưa xác định'],
            },
          },
          { merge: true }
        );
        setIsFavorite(true);
        Alert.alert('Thông báo', 'Bài hát đã được thêm vào danh sách yêu thích.');
      }
    } catch (error) {
      console.log('Lỗi khi cập nhật danh sách yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) return;

        const songId = String(currentSong.id);
        const userfavoriteRef = firestore().collection('favorite').doc(userId);
        const userfavoriteDoc = await userfavoriteRef.get();

        if (userfavoriteDoc.exists) {
          const favoriteData = userfavoriteDoc.data();
          if (favoriteData && favoriteData[songId]) {
            setIsFavorite(true);
          } else {
            setIsFavorite(false);
          }
        }
      } catch (error) {
        console.log('Lỗi khi kiểm tra trạng thái yêu thích:', error);
      }
    };

    checkFavoriteStatus();
  }, [currentSong]);

  const download = async () => {
    try {
      setIsDownloading(true);
      const fileUrl = currentSong.videoUrl;
      const fileName = `${currentSong.name}.mp4`;
      const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: destinationPath,
      }).promise;

      if (result.statusCode === 200) {
        console.log('Download successful:', destinationPath);
        console.log('Tải về thành công!');
      } else {
        console.log('Download failed:', result);
        console.log('Tải về thất bại.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      console.log('Đã xảy ra lỗi khi tải về.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container isScroll={false} style={{ backgroundColor: colors.black }}>
      <TouchableWithoutFeedback onPress={handlePressScreen}>
        <View style={styles.videoContainer}>
          <YoutubeIframe
            ref={playerRef}
            videoId={currentSong.id}
            height={width * (9 / 16)}
            width={width}
            play={false}
            initialPlayerParams={{
              modestbranding: true,
              rel: false,
            }}
          />

          {showControls && (
            <Section styles={styles.overlay}>
              <TouchableOpacity style={styles.overlayButton} onPress={handlePrevious}>
                <Ionicons name="play-skip-back" size={30} color={colors.white} />
              </TouchableOpacity>
              <Space width={150} />
              <TouchableOpacity style={styles.overlayButton} onPress={handleNext}>
                <Ionicons name="play-skip-forward" size={30} color={colors.white} />
              </TouchableOpacity>
            </Section>
          )}
        </View>
      </TouchableWithoutFeedback>
      <Space height={20} />
      <Section>
        <TextComponent styles={{ borderBottomColor: colors.black2, borderBottomWidth: 2, paddingVertical: 10, marginBottom: 10 }} text={currentSong.name} size={sizes.title} font={fontFamilies.bold} color={colors.white} />
        <Space height={8} />
        <Row justifyContent='flex-start' styles={{
          gap: 16, borderBottomColor: colors.black2,
          borderBottomWidth: 2,
          paddingBottom: 15,
          marginBottom: 10,
        }}>
          <TouchableOpacity onPress={() => { }}>
            <Image width={50} height={50} source={{ uri: currentSong.image }} style={{ width: 100, height: 100, borderRadius: 200, borderColor: colors.white, borderWidth: 2 }} />
          </TouchableOpacity>
          <View>
            <TextComponent text={`Ca sĩ: ${currentSong.artists}`} size={sizes.title} font={fontFamilies.bold} color={colors.grey2} />
            <TextComponent
              styles={{ maxWidth: 250 }}
              text={
                (currentSong?.genres[0] === "Unknown Genre")
                  ? 'Thể loại: Chưa xác định'
                  : `Thể loại: ${currentSong.genres[0]}`
              }
              size={sizes.title}
              font={fontFamilies.bold}
              color={colors.grey2}
            />

          </View>
        </Row>
      </Section>

      <Section>
        <Row justifyContent='flex-start' styles={{ gap: 30, borderBottomColor: colors.black2, borderBottomWidth: 2, paddingBottom: 15 }}>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={saveTofavorite}>
            <AntDesign name="heart" size={30} color={isFavorite ? colors.red : colors.white} />
            <Space height={8} />
            <TextComponent size={18} text="Yêu thích" color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }}>
            <FontAwesome name="share" size={30} color={colors.white} />
            <Space height={8} />
            <TextComponent size={18} text="Chia sẻ" color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={download}
            disabled={isDownloading}
          >
            <Octicons name="download" size={30} color={isDownloading ? colors.grey : colors.white} />
            <Space height={8} />
            <TextComponent size={18} text={isDownloading ? "..." : "Tải về"} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => { navigation.navigate('ShowPlaylist', { selectedSong: currentSong }); }}
          >
            <Entypo name='add-to-list' size={30} color={colors.white} />
            <Space height={8} />
            <TextComponent text="Thêm" color={colors.white} />
          </TouchableOpacity>
        </Row>

      </Section>

      <Section>
        <Row justifyContent="flex-start" styles={{ width: '100%' }}>
          <Input
            bordered={false}
            color="transparent"
            styles={{
              width: sizes.width - 40,
              paddingHorizontal: 0,
            }}
            value={newComment}
            onChange={setNewComment}
            placeholderColor={colors.white}
            inputStyles={{ color: colors.white, fontSize: 18 }}
            placeholder="Nhập bình luận"
            prefix={
              user?.photoURL ? (
                <Row
                  styles={{
                    position: 'relative',
                    borderRadius: 100,
                    width: 30,
                    height: 30,
                    overflow: 'hidden',
                  }}>
                  <Image
                    source={{ uri: user.photoURL }}
                    width={20}
                    height={20}
                    style={{ width: 40, height: 40 }}
                  />
                </Row>
              ) : (
                <FontAwesome6
                  name="circle-user"
                  color={colors.white}
                  size={40}
                />
              )
            }
            affix={
              <TouchableOpacity onPress={handlePostComments}>
                <Ionicons name="send" color={colors.white} size={24} />
              </TouchableOpacity>
            }
          />
        </Row>
        <Space height={4} />

        {reviews?.length > 0 ? (
          <View>
            <Row alignItems="flex-start" styles={{ flexDirection: 'column' }}>
              {reviews[0]?.comments.map((item, index) => (
                <Row
                  styles={{
                    position: 'relative',
                    marginBottom: 10,
                    width: sizes.width - 50,
                  }}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  key={index}>
                  <Row alignItems="flex-start">
                    {item?.photoUrl ? (
                      <Row
                        styles={{
                          position: 'relative',
                          borderRadius: 100,
                          width: 30,
                          height: 30,
                          overflow: 'hidden',
                        }}>
                        <Image
                          source={{ uri: item.photoUrl }}
                          width={20}
                          height={20}
                          style={{ width: 30, height: 30 }}
                        />
                      </Row>
                    ) : (
                      <FontAwesome6
                        name="circle-user"
                        color={colors.white}
                        size={30}
                      />
                    )}
                    <Space width={12} />
                    <Row
                      alignItems="flex-start"
                      styles={{ flexDirection: 'column' }}>
                      <TextComponent
                        font={fontFamilies.medium}
                        color={colors.white}
                        text={item.user}
                      />
                      <TextComponent
                        styles={{ maxWidth: sizes.width * 0.5 }}
                        color={colors.white}
                        text={item.userComments}
                      />
                    </Row>
                  </Row>
                  <Row>
                    <TextComponent
                      styles={{
                        textAlign: 'right',
                      }}
                      color={colors.grey}
                      text={parseTime(item.timestamp)}
                    />
                    {item?.userId === user?.uid && (
                      <>
                        <Space width={8} />
                        <TouchableOpacity
                          onPress={() =>
                            handleDeleteComment(index, reviews[0])
                          }>
                          <TextComponent
                            font={fontFamilies.medium}
                            text="Xóa"
                            color={colors.red}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </Row>
                </Row>
              ))}
            </Row>
          </View>
        ) : (
          <Section>
            <Row>
              <TextComponent
                font={fontFamilies.medium}
                color={colors.white}
                text="Chưa có bình luận nào"
              />
            </Row>
          </Section>
        )}


      </Section>

    </Container>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
});

export default MusicDetail;
