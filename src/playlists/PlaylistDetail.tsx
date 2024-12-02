import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TextComponent from '../components/TextComponent';
import Container from '../components/Container';
import { colors } from '../constants/colors';
import { fontFamilies } from '../constants/fontFamilies';
import { Section, Space } from '@bsdaoquang/rncomponent';

const PlaylistDetail = ({ route, navigation }: any) => {
    const { playlist } = route.params;
  
    if (!playlist) {
      return <TextComponent text="Playlist không tìm thấy" font="regular" size={18} />;
    }
  
    const songs = playlist.songs || [];
    
    return (
      <Container style ={{backgroundColor: colors.white}}>
        <Section>
        <View style={{alignSelf: 'center'}}>
            <TextComponent text={playlist.name} font={fontFamilies.semiBold} size={35}/>
        </View>
        </Section>
        
        {songs.length === 0 ? (
          <TextComponent text="" font="regular" size={18} />
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <View>
                <TextComponent text={item.name} font="regular" size={20} />
                <TextComponent text={item.artist} font="regular" size={16} />
              </View>
            )}
          />
        )}
        <Section>
        <TouchableOpacity onPress={() => {navigation.navigate('Add'), {playlist}}}
          style={[
            styles.createButton,
            {backgroundColor: colors.blue},
          ]}
          >
          <TextComponent
            text="Thêm bài hát vào danh sách"
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
      fontFamily: fontFamilies.semiBold,
    },
  });

export default PlaylistDetail;
