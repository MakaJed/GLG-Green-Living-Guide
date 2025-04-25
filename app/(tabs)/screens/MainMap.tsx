import React from 'react-native';
import { Image, View } from 'react-native';
import mapData from '../../../assets/maps/Pellet Town.json';
import tilesetImage from '../../../assets/images/tileset.png';


const TILE_SIZE = 32;

const TileMap = () => {
  const layer = Tilemap.layers.find(l => l.name === 'Ground'); // Example layer
  const tiles = layer?.data || [];

  return (
    <View style={{ position: 'absolute' }}>
      {tiles.map((tileId, index) => {
        if (tileId === 0) return null; // Empty tile
        const row = Math.floor(index / tilemap.width);
        const col = index % tilemap.width;

        // Get sourceX/sourceY from tileset image assuming 1 row of tiles
        const sourceX = ((tileId - 1) % (tilesetImageWidth / TILE_SIZE)) * TILE_SIZE;
        const sourceY = 0; // Adjust if your tileset has multiple rows

        return (
          <Image
            key={index}
            source={tilesetImage}
            style={{
              position: 'absolute',
              left: col * TILE_SIZE,
              top: row * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              // If using sprite sheet, use cropping via 'resizeMode' or masking
            }}
          />
        );
      })}
    </View>
  );
};
