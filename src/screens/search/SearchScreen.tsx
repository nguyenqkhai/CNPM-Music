import { Input, Row, Section, Space } from '@bsdaoquang/rncomponent';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, FlatList, Image, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { fontFamilies } from '../../constants/fontFamilies';
import { Song } from '../../constants/models';
import { sizes } from '../../constants/sizes';
import TextComponent from '../../components/TextComponent';
import Container from '../../components/Container';
import { getMusicListByKeyword } from '../../utils/handleAPI';

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestedSongs = useCallback(async () => {
    setLoading(true);
    try {
      const items: Song[] = (await getMusicListByKeyword('music')) || [];
      setSuggestedSongs(items);
    } catch (error) {
      console.error('Error fetching suggested songs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const items: Song[] = (await getMusicListByKeyword(query)) || [];
      setSearchResults(items);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery);
    } else {
      setSearchResults([]);
      fetchSuggestedSongs();
    }
  }, [searchQuery, fetchSearchResults, fetchSuggestedSongs]);

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      onPress={() => { navigation.navigate('MusicDetail', { song: item, playlist: suggestedSongs }) }}
    >
      <Row
        justifyContent="space-between"
        styles={{
          paddingVertical: 12,
          borderBottomColor: colors.black,
          borderBottomWidth: 0.5,
        }}
      >
        <Row>
          <Image
            source={{ uri: item.image }}
            width={50}
            height={50}
            style={{ width: 80, height: 80 }}
          />
          <Space width={12} />
          <View>
            <Animated.Text
              style={{
                fontFamily: fontFamilies.semiBold,
                width: 250,
                fontSize: sizes.text,
                overflow: 'hidden',
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.name}
            </Animated.Text>
            <Animated.Text
              style={{
                fontFamily: fontFamilies.regular,
                width: 250,
                fontSize: sizes.desc,
                overflow: 'hidden',
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.artists}
            </Animated.Text>
          </View>
        </Row>
        <AntDesign color={colors.black} name="playcircleo" size={24} />
      </Row>
    </TouchableOpacity>
  );


  return (
    <Container isScroll={false} style={{ backgroundColor: colors.white }}>
      <Section styles={{ marginTop: 45 }}>
        <Row alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              style={{ marginBottom: 10 }}
              name="chevron-back"
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
          <Input
            prefix={<AntDesign name="search1" size={sizes.title} color={colors.black} />}
            clear
            inputStyles={{ color: colors.black }}
            color={colors.white}
            styles={{ width: 350, paddingVertical: 4 }}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholderColor={colors.black}
            placeholder="Tên bài hát, nghệ sĩ, album"
          />
        </Row>
      </Section>

      <Section>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextComponent size={sizes.title} color={colors.black} text="Đang tải..." />
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.black}
              text="Kết quả tìm kiếm"
            />
            <Space height={20} />
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 200 }}
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
              removeClippedSubviews
            />
          </>
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <Section>
            <Row alignItems="center" styles={{ flexDirection: 'column', marginTop: 20 }}>
              <Image
                source={require('../../../assets/images/luffy.jpg')}
                width={150}
                height={100}
                style={{ width: 150, height: 100 }}
              />
              <Space height={12} />
              <TextComponent
                size={sizes.bigTitle}
                color={colors.black}
                text="Không tìm thấy kết quả"
              />
            </Row>
          </Section>
        ) : (
          <>
            <TextComponent
              font={fontFamilies.semiBold}
              size={sizes.bigTitle}
              color={colors.black}
              text="Gợi ý tìm kiếm"
            />
            <Space height={16} />
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 200 }}
              data={suggestedSongs}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
              initialNumToRender={8}
              removeClippedSubviews
            />
          </>
        )}
      </Section>
    </Container>
  );
};

export default SearchScreen;
