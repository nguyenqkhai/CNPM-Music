import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TextComponent from '../../components/TextComponent';
import { fontFamilies } from '../../constants/fontFamilies';
import { Row, Section, Space } from '@bsdaoquang/rncomponent';
import Container from '../../components/Container';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Library = ({ navigation }: any) => {
  const [recently, setRecently] = useState<any[]>([]);
  const [marqueeAnim] = useState(new Animated.Value(0));
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const fetchRecently = () => {
    const userId = auth().currentUser?.uid;
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
        console.log('Đã xóa playlist:', playlistId);
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
      <Section styles={{ paddingTop: 20, borderBottomWidth: 1, borderBottomColor: colors.black2, paddingBottom: 36 }}>
        <TextComponent text="Thư viện" font={fontFamilies.bold} size={28} />
        <Space height={20} />
        <Row justifyContent="space-around">
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Favorite')}>
            <Icon name="favorite" size={30} color="dodgerblue" />
            <TextComponent size={18} text="Yêu thích" font={fontFamilies.regular} />
            <TextComponent size={18} text={`${favoriteCount}`} font={fontFamilies.bold} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Icon name="file-download" size={30} color="purple" />
            <TextComponent size={18} text="Tải về" font={fontFamilies.regular} />
            <TextComponent size={18} text="10" font={fontFamilies.bold} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Icon name="cloud-upload" size={30} color="orange" />
            <TextComponent size={18} text="Tải lên" font={fontFamilies.regular} />
            <TextComponent size={18} text="10" font={fontFamilies.bold} />
          </TouchableOpacity>
        </Row>
      </Section>

      <Space height={20} />

      <Section styles={{ borderBottomColor: colors.black2, borderBottomWidth: 1, paddingBottom: 36 }}>
        <TextComponent
          text="Nghe gần đây >"
          font={fontFamilies.bold}
          size={28}
        />
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
              <TouchableOpacity onPress={() => {
                navigation.navigate('MusicDetail', { song: item, playlist: recently })
                console.log(item);
              }
              }>
                <View style={{ flexDirection: 'column', alignItems: 'center', width: 230 }}>
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
                      textAlign: 'center'
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
              onPress={() => { navigation.navigate('PlaylistDetail', { playlist: item }); console.log(item.id) }}
              style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
              <View
                style={{
                  elevation: 2,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: colors.white,
                  marginRight: 10,
                }}>
                {item.image ? (
                  <Image
                    source={item.image}
                    style={{ height: 100, width: 100 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      backgroundColor: colors.grey,
                    }}
                  />
                )}
                {/* <Image source={{uri:}}/> */}
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
              <TouchableOpacity style={{ padding: 10 }} onPress={() => { deletePlaylist(item.id) }}>
                <Icon name="delete" size={30} color={colors.red} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
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
});

export default Library;
