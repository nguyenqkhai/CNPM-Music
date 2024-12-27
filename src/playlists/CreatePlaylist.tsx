import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Container from '../components/Container';
import { colors } from '../constants/colors';
import TextComponent from '../components/TextComponent';
import { fontFamilies } from '../constants/fontFamilies';
import { Input, Section, Space } from '@bsdaoquang/rncomponent';
import AntDesign from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

const CreatePlaylist = ({ navigation }: any) => {
  const [playlistName, setPlaylistName] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      if (!playlistName.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng nhập tên playlist.',
        });
        return;
      }
      return;
    }

    const userId = auth().currentUser?.uid;
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Bạn chưa đăng nhập.',
      })
      return;
    }

    try {
      const playlistId = firestore().collection('playlists').doc().id;
      const playlistRef = firestore().collection('playlists').doc(userId)
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      await playlistRef.set(
        {
          [playlistId]: {
            auther: userData?.userName,
            name: playlistName,
            songs: []
          }
        },
        { merge: true }
      );
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Playlist đã được tạo.'
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo playlist. Vui lòng thử lại.'
      })
    }
  };

  const handleChangeText = (text: string) => {
    setPlaylistName(text);
    setIsButtonEnabled(text.trim() !== '');
  };

  return (
    <Container style={{ backgroundColor: colors.white }}>
      <Space height={20} />

      <Section
        styles={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingHorizontal: 10,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Space width={100} />
        <TextComponent
          text="Tạo playlist"
          font={fontFamilies.semiBold}
          size={24}
          styles={{
            flex: 1,
            textAlign: 'center',
            marginRight: 24,
          }}
        />
      </Section>

      <Section>
        <TextComponent text="Tên playlist" />
        <Input
          placeholder="Nhập tên playlist"
          value={playlistName}
          onChange={handleChangeText}
          clear
        />
      </Section>

      <Section>
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: isButtonEnabled ? colors.blue : colors.grey },
          ]}
          onPress={() => {
            if (isButtonEnabled) {
              handleCreatePlaylist();
              navigation.goBack();
            }
          }}
          disabled={!isButtonEnabled}>
          <TextComponent
            text="TẠO PLAYLIST"
            size={16}
            styles={styles.createButtonText}
          />
        </TouchableOpacity>
      </Section>
    </Container>
  );
};
const styles = StyleSheet.create({
  createButton: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fontFamilies.bold,
  },
});

export default CreatePlaylist;
