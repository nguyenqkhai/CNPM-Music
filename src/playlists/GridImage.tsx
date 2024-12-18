import { sizes } from '../constants/sizes';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const GridImage = ({ images }: { images: string[] }) => {
    const maxImages = images.slice(0, 4);
    const gridSize = Math.min(maxImages.length, 4);
    return (
        <View
            style={[
                styles.gridContainer,
                gridSize === 2 && styles.twoImages,
                gridSize === 3 && styles.threeImages,
                gridSize === 4 && styles.fourImages,
            ]}
        >
            {maxImages.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.gridImage} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: sizes.width * 0.9,
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gridImage: {
        width: '50%',
        height: '50%',
    },
    twoImages: {
        flexDirection: 'column',
    },
    threeImages: {
        justifyContent: 'space-between',
    },
    fourImages: {
        flexDirection: 'row',
    },
});

export default GridImage;
