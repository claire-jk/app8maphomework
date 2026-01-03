import FontAwesome from '@expo/vector-icons/FontAwesome';
import config from '@gluestack-ui/config';
import {
  Box,
  Center,
  Fab,
  FabIcon,
  GluestackUIProvider,
  Text
} from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import mapStyle from "../../scripts/mapStyle.json";
import stationsData from "../../scripts/stations.json";
import youbikeData from "../../scripts/YoubikeTaipei.json";

export default function App() {
  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.02,
    latitudeDelta: 0.02,
  });

  const [marker, setMarker] = useState({
    coord: { latitude: 25.024624, longitude: 121.544637 },
  });

  const [selectedBike, setSelectedBike] = useState<any | null>(null);

  const setRegionAndMarker = (location: any) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const goToMyLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setRegionAndMarker(location);
    })();
  }, []);

  const rent = selectedBike?.available_rent_bikes ?? 0;
  const ret = selectedBike?.available_return_bikes ?? 0;

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <Box style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            region={region}
            style={styles.map}
            customMapStyle={mapStyle}
            onPress={() => setSelectedBike(null)}
          >
            {youbikeData.slice(0, 100).map((bike) => (
              <Marker
                key={bike.sno}
                coordinate={{
                  latitude: bike.latitude,
                  longitude: bike.longitude,
                }}
                onPress={() => setSelectedBike(bike)}
              >
                <FontAwesome name="bicycle" size={20} color="#4CAF50" />
              </Marker>
            ))}

            {stationsData.map((station) => (
              <Marker
                key={station.StationUID}
                coordinate={{
                  latitude: station.StationPosition.PositionLat,
                  longitude: station.StationPosition.PositionLon,
                }}
              >
                <FontAwesome name="subway" size={24} color="#0072BC" />
              </Marker>
            ))}

            <Marker coordinate={marker.coord}>
              <FontAwesome name="map-marker" size={34} color="#B12A5B" />
            </Marker>
          </MapView>

          {selectedBike && (
            <Box style={styles.sheet}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => setSelectedBike(null)}
              >
                <Text>✕</Text>
              </TouchableOpacity>

              <Text style={styles.title}>
                {selectedBike.sna.replace("YouBike2.0_", "")}
              </Text>

              <Text style={styles.address}>{selectedBike.ar}</Text>

              <Text style={styles.time}>
                更新時間：{selectedBike.mday}
              </Text>

              {/* ✅ 圓餅圖：真正置中 */}
              <Center style={{ marginTop: 24 }}>
                <Box style={{ alignItems: 'center' }}>
                  <Svg width={160} height={160} viewBox="0 0 100 100">
                    {/* 左半圓：可還 */}
                    <Path
                      d="M50 50 L50 0 A50 50 0 0 0 50 100 Z"
                      fill="#E57373"
                    />

                    {/* 右半圓：可借 */}
                    <Path
                      d="M50 50 L50 0 A50 50 0 0 1 50 100 Z"
                      fill="#FDD835"
                    />
                  </Svg>
                </Box>

                {/* legend：順序修正 */}
                <Box style={styles.legend}>
                  <Text style={{ color: '#E57373' }}>
                    可還 ({ret})
                  </Text>
                  <Text style={{ color: '#FDD835' }}>
                    可借 ({rent})
                  </Text>
                </Box>
              </Center>
            </Box>
          )}

          {/* ✅ FAB 不再跑版 */}
          <Fab
            size="lg"
            placement="bottom right"
            onPress={goToMyLocation}
            style={styles.fab}
          >
            <FabIcon
              as={() => (
                <FontAwesome name="crosshairs" size={28} color="white" />
              )}
            />
          </Fab>
        </Box>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9a9a9ade',

  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  close: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  address: {
    fontSize: 14,
    color: '#666',
  },

  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  legend: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    justifyContent: 'space-around',
  },
});