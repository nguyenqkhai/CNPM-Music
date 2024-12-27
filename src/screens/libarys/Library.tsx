import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TextComponent from '../../components/TextComponent';
import { fontFamilies } from '../../constants/fontFamilies';
import { Row, Section, Space, Text } from '@bsdaoquang/rncomponent';
import Container from '../../components/Container';
import { colors } from '../../constants/colors';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { sizes } from '../../constants/sizes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const Library = ({ navigation }: any) => {
  const [recently, setRecently] = useState<any[]>([]);
  const [marqueeAnim] = useState(new Animated.Value(0));
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const userId = auth().currentUser?.uid;

  const fetchRecently = () => {
    if (userId) {
      try {
        const useRef = firestore().collection('recently list').doc(userId);
        useRef.onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            const songs = Object.values(data || {});
            setRecently(songs);
          }
        });
      } catch (error) {
        console.log('Lỗi khi tải dữ liệu bài hát đã nghe gần đây: ', error);
      }
    }
  };

  const fetchFavorites = () => {
    const userId = auth().currentUser?.uid;
    if (userId) {
      try {
        const favoritesRef = firestore().collection('favorite').doc(userId);
        favoritesRef.onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            const favoriteSongs = Object.values(data || []);
            setFavoriteCount(favoriteSongs.length);
          }
        });
      } catch (error) {
        console.log('Lỗi khi tải danh sách yêu thích: ', error);
      }
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    const userId = auth().currentUser?.uid;
    if (userId) {
      try {
        const playlistRef = firestore().collection('playlists').doc(userId);
        await playlistRef.update({
          [playlistId]: firestore.FieldValue.delete(),
        });
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã xóa playlist.'
        })
      } catch (error) {
        console.log('Lỗi khi xóa playlist:', error);
      }
    }
  };

  const startMarquee = () => {
    marqueeAnim.setValue(0);
    Animated.timing(marqueeAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  };

  const fetchPlaylists = () => {
    const userId = auth().currentUser?.uid;
    if (userId) {
      try {
        const playlistRef = firestore().collection('playlists').doc(userId);
        playlistRef.onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data() || {};
            const playlists = Object.keys(data).map(playlistId => ({
              id: playlistId,
              ...data[playlistId],
            }));
            setPlaylists(playlists);
          }
        });
      } catch (error) {
        console.log('Lỗi khi tải playlist: ', error);
      }
    }
  };

  const renamePlaylist = async () => {
    if (newPlaylistName === "") {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Hãy đặt tên mới cho playlist.',
      });
      return;
    }
    if (userId && selectedPlaylist && newPlaylistName.trim()) {
      try {
        const playlistRef = firestore().collection('playlists').doc(userId);
        const userPlaylists = await playlistRef.get();
        const playlistsData = userPlaylists.data();
        const isDuplicate = Object.values(playlistsData || {}).some(
          (playlist: any) => playlist.name?.toLowerCase() === newPlaylistName.toLowerCase()
        );

        if (isDuplicate) {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Tên playlist đã tồn tại. Vui lòng chọn tên khác.',
          });
          return;
        }
        await playlistRef.update({
          [`${selectedPlaylist.id}.name`]: newPlaylistName,
        });
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã đổi tên playlist.',
        });
        setRenameModalVisible(false);
        setNewPlaylistName('');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Đổi tên playlist thất bại. Vui lòng thử lại.',
        });
      }
    }
  };

  const showRenameModal = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setRenameModalVisible(true);
  };

  useEffect(() => {
    fetchRecently();
    startMarquee();
    fetchPlaylists();
    fetchFavorites();
  }, []);

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}>
      <Section
        styles={{
          paddingTop: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.black2,
          paddingBottom: 36,
        }}>
        <TextComponent text="Thư viện" font={fontFamilies.bold} size={28} />
        <Space height={20} />
        <Row justifyContent="space-around">
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Favorite')}>
            <Icon name="favorite" size={30} color="dodgerblue" />
            <TextComponent
              size={18}
              text="Yêu thích"
              font={fontFamilies.regular}
            />
            <TextComponent
              size={18}
              text={`${favoriteCount}`}
              font={fontFamilies.bold}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Download')}>
            <Icon name="file-download" size={30} color="purple" />
            <TextComponent
              size={18}
              text="Tải về"
              font={fontFamilies.regular}
            />
            <TextComponent size={18} text="10" font={fontFamilies.bold} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Statistics')}>
            <Icon name="cloud-upload" size={30} color="orange" />
            <TextComponent
              size={18}
              text="Thống kê"
              font={fontFamilies.regular}
            />
            <TextComponent size={18} text="10" font={fontFamilies.bold} color={colors.white} />
          </TouchableOpacity>
        </Row>
      </Section>

      <Space height={20} />

      <Section
        styles={{
          borderBottomColor: colors.black2,
          borderBottomWidth: 1,
          paddingBottom: 36,
        }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextComponent
            text="Nghe gần đây"
            font={fontFamilies.bold}
            size={28}
          />
          <Feather name="chevron-right" size={28} style={{ fontFamily: fontFamilies.bold, position: 'absolute', right: 8 }} />
        </TouchableOpacity>
        <Space height={12} />
        <FlatList
          data={recently}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                margin: 10,
                elevation: 2,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: colors.white,
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('MusicDetail', {
                    song: item,
                    playlist: recently,
                  });
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 230,
                  }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 356, height: 200 }}
                  />
                  <Animated.Text
                    style={{
                      fontFamily: fontFamilies.semiBold,
                      width: 200,
                      paddingHorizontal: 12,
                      paddingTop: 12,
                      paddingBottom: 8,
                      overflow: 'hidden',
                      textAlign: 'center',
                      fontSize: 18,
                    }}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {item.name}
                  </Animated.Text>

                  <Animated.Text
                    style={{
                      fontFamily: fontFamilies.semiBold,
                      width: 200,
                      paddingHorizontal: 12,
                      paddingBottom: 8,
                      fontSize: 18,
                      overflow: 'hidden',
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.artists}
                  </Animated.Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      </Section>

      <Section styles={{ paddingTop: 20 }}>
        <TextComponent text="Playlist" font={fontFamilies.bold} size={28} />
        <TouchableOpacity
          onPress={() => navigation.navigate('Create')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
          <View
            style={{
              width: 100,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              margin: 10,
              elevation: 2,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: colors.white,
            }}>
            <Icon name="add" size={50} color="grey" />
          </View>
          <Space width={10} />
          <View>
            <TextComponent
              size={20}
              text="Tạo mới playlist"
              font={fontFamilies.semiBold}
            />
          </View>
        </TouchableOpacity>
        <Space height={10} />
        <FlatList
          scrollEnabled={false}
          data={playlists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('PlaylistDetail', { playlist: item });
              }}
              style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
              <View
                style={{
                  elevation: 2,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: colors.white,
                  marginRight: 10,
                }}>
                <Image
                  source={require('../../../assets/images/playlist.png')}
                  style={{ height: 100, width: 100 }}
                />
              </View>
              <Space width={10} />
              <View style={{ flex: 1 }}>
                <TextComponent
                  text={item.name}
                  font={fontFamilies.semiBold}
                  size={20}
                />
                <TextComponent
                  text={`${item.auther}`}
                  font={fontFamilies.regular}
                  size={18}
                />
              </View>
              <Menu>
                <MenuTrigger>
                  <Ionicons name="ellipsis-vertical" size={sizes.icon} color={colors.black} />
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption
                    style={{ padding: 8, borderBottomColor: colors.black2, borderBottomWidth: 1 }}
                    onSelect={() => { showRenameModal(item) }}
                  >
                    <TextComponent text="Đổi tên playlist" />
                  </MenuOption>
                  <MenuOption
                    style={{ padding: 8 }}
                    onSelect={() => { deletePlaylist(item.id) }}>
                    <TextComponent
                      text='Xóa playlist'
                    />
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </TouchableOpacity>
          )}
        />
        <Modal
          transparent
          visible={isRenameModalVisible}
          onRequestClose={() => setRenameModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextComponent text="Đổi tên playlist" font={fontFamilies.bold} size={20} />
              <TextInput
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                style={styles.input}
                placeholder="Nhập tên mới cho playlist"
              />
              <Row justifyContent="space-between">
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setRenameModalVisible(false)}>
                  <TextComponent text="Thoát" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={renamePlaylist}>
                  <TextComponent text="Lưu" />
                </TouchableOpacity>
              </Row>
            </View>
          </View>
        </Modal>
      </Section>
    </Container>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.grey,
    width: '30%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
});

export default Library;
