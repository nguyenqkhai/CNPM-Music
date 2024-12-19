import { sizes } from '../constants/sizes';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const GridImage = ({ images }: { images: string[] }) => {
    const maxImages = images.slice(0, 4);
    const gridSize = maxImages.length;

    const gridSizeStyles: { [key: number]: any } = {
        1: styles.gridSize1,
        2: styles.gridSize2,
        3: styles.gridSize3,
        4: styles.gridSize4,
    };

    const imageSizeStyles: { [key: number]: any } = {
        1: styles.imageSize1,
        2: styles.imageSize2,
        3: styles.imageSize3,
        4: styles.imageSize4,
    };

    return (
        <View style={[styles.gridContainer, gridSizeStyles[gridSize]]}>
            {maxImages.map((uri, index) => (
                <Image
                    key={index}
                    source={{ uri }}
                    style={[styles.gridImage, imageSizeStyles[gridSize]]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        width: sizes.width * 0.9,
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gridSize1: {
        flexDirection: 'row',
    },
    gridSize2: {
        flexDirection: 'row',
    },
    gridSize3: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridSize4: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridImage: {
        borderWidth: 1,
        borderColor: '#fff',
    },
    imageSize1: {
        width: '100%',
        height: '100%',
    },
    imageSize2: {
        width: '50%',
        height: '100%',
    },
    imageSize3: {
        width: '33.33%',
        height: '100%',
    },
    imageSize4: {
        width: '50%',
        height: '50%',
    },
});

export default GridImage;
