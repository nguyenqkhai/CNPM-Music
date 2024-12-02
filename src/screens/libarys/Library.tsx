import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  Alert,
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
  }, []);

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}>
      <Section>
        <TextComponent text="Thư viện" font={fontFamilies.bold} size={28} />
        <Space height={20} />
        <Row justifyContent="space-around">
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Favorite')}>
            <Icon name="favorite" size={sizes.icon} color="dodgerblue" />
            <TextComponent text="Yêu thích" font={fontFamilies.regular} />
            <TextComponent text="10" font={fontFamilies.bold} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Icon name="file-download" size={sizes.icon} color="purple" />
            <TextComponent text="Tải về" font={fontFamilies.regular} />
            <TextComponent text="10" font={fontFamilies.bold} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Icon name="cloud-upload" size={sizes.icon} color="orange" />
            <TextComponent text="Tải lên" font={fontFamilies.regular} />
            <TextComponent text="10" font={fontFamilies.bold} />
          </TouchableOpacity>
        </Row>
      </Section>

      <Space height={20} />

      <Section>
        <TextComponent
          text="Nghe gần đây >"
          font={fontFamilies.semiBold}
          size={20}
        />
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
                console.log(item.id);
              }
              }>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 200, height: 200 }}
                  />
                  <Animated.Text
                    style={{
                      fontFamily: fontFamilies.semiBold,
                      width: 200,
                      overflow: 'hidden',
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.name}
                  </Animated.Text>

                  <Animated.Text
                    style={{
                      fontFamily: fontFamilies.semiBold,
                      width: 200,
                      overflow: 'hidden',
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

      <Section>
        <TextComponent text="Playlist" font={fontFamilies.semiBold} size={20} />
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
          <View>
            <TextComponent
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
              onPress={() => { navigation.navigate('PlaylistDetail', { playlist: item }) }}
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
              </View>
              <View style={{ flex: 1 }}>
                <TextComponent
                  text={item.name}
                  font={fontFamilies.semiBold}
                  size={20}
                />
                <TextComponent
                  text={`${item.auther}`}
                  font={fontFamilies.regular}
                  size={16}
                />
              </View>
              <TouchableOpacity style={{ padding: 10 }}>
                <Icon name="delete" size={24} color={colors.red} />
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
