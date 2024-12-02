import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

const MusicScreenDetail = () => {
    return (
        <View style={styles.container}>
            <YoutubeIframe
                videoId="va9UiC00XPs"
                height={width * (9 / 16)}
                width={width}
                play={true}
                initialPlayerParams={{
                    controls: false,
                    modestbranding: true,
                    rel: false,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});

export default MusicScreenDetail;
