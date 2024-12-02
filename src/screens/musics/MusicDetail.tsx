import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YoutubeIframe from 'react-native-youtube-iframe';
import Container from '../../components/Container';
import { Section, Space, Text } from '@bsdaoquang/rncomponent';
import { colors } from '../../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TextComponent from '../../components/TextComponent';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { sizes } from '../../constants/sizes';
import { fontFamilies } from '../../constants/fontFamilies';
import Octicons from 'react-native-vector-icons/Octicons'
import RNFS from 'react-native-fs'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'

const MusicDetail = ({ route }: any) => {
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
  const { width } = Dimensions.get('window');

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

      // Lấy dữ liệu hiện tại
      const userfavoriteDoc = await userfavoriteRef.get();
      const favoriteData = userfavoriteDoc.exists ? userfavoriteDoc.data() : {};

      // Kiểm tra bài hát có trong danh sách yêu thích hay không
      const isCurrentlyFavorite = favoriteData && favoriteData[songId];

      if (isCurrentlyFavorite) {
        // Nếu bài hát đã yêu thích => Xóa
        await userfavoriteRef.update({
          [songId]: firestore.FieldValue.delete(),
        });
        setIsFavorite(false);
        Alert.alert('Thông báo', 'Bài hát đã được xóa khỏi danh sách yêu thích.');
      } else {
        // Nếu bài hát chưa yêu thích => Thêm
        await userfavoriteRef.set(
          {
            [songId]: {
              name: currentSong.name,
              artists: currentSong.artists || 'Unknown',
              image: currentSong.image,
              videoUrl: currentSong.videoUrl,
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

  const dowload = async () => {
    try {
      setIsDownloading(true); // Hiển thị trạng thái tải
      const fileUrl = currentSong.videoUrl; // URL video
      const fileName = `${currentSong.name}.mp4`; // Tên file
      const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`; // Thư mục tải về

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
      setIsDownloading(false); // Ẩn trạng thái tải
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
        <TextComponent text={currentSong.name} size={sizes.title} font={fontFamilies.semiBold} color={colors.white} />
      </Section>

      <Space height={30} />
      <Section
        styles={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={saveTofavorite}>
          <AntDesign name="heart" size={50} color={isFavorite ? colors.red : colors.white} />
          <TextComponent text="Yêu thích" color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: 'center' }}>
          <FontAwesome name="share" size={50} color={colors.white} />
          <TextComponent text="Chia sẻ" color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={dowload}
          disabled={isDownloading}
        >
          <Octicons name="download" size={50} color={isDownloading ? colors.grey : colors.white} />
          <TextComponent text={isDownloading ? "Đang tải..." : "Tải về"} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity>

        </TouchableOpacity>
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
