// app/components/inputsearch.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
    Box,
    Center,
    FlatList,
    HStack,
    Input,
    InputField,
    InputIcon,
    InputSlot,
    SearchIcon,
    Spinner,
    Text,
    VStack
} from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function InputSearch() {

  const [searchQuery, setSearchQuery] = useState('');
  const [bikeData, setBikeData] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* 取得位置 */
  const fetchUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    } catch (error) {
      console.error("取得使用者位置失敗", error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      await fetchUserLocation();
    })();
  }, []);

  /* 抓取 YouBike */
  const fetchBikeData = async () => {
    try {
      const response = await fetch(
        "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
      );
      const data = await response.json();
      setBikeData(data);
    } catch (error) {
      console.error("取得 YouBike 資料失敗", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBikeData();
    const interval = setInterval(fetchBikeData, 30000);
    return () => clearInterval(interval);
  }, []);

  /* 距離計算 */
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /* 距離自動刷新 */
  useEffect(() => {
    const interval = setInterval(() => {
      if (userLocation) setBikeData(prev => [...prev]);
    }, 10000);

    return () => clearInterval(interval);
  }, [userLocation]);

  /* 過濾排序 */
  const filteredStations = useMemo(() => {
    let result = bikeData;

    if (searchQuery.trim() !== '') {
      result = result.filter(item =>
        item.sna.includes(searchQuery) ||
        item.ar.includes(searchQuery)
      );
    }

    if (userLocation) {
      result = result.map(item => ({
        ...item,
        distance: getDistance(
          userLocation.latitude,
          userLocation.longitude,
          Number(item.latitude),
          Number(item.longitude)
        ),
        rent: item.available_rent_bikes,
        ret: item.available_return_bikes
      }));

      result.sort((a, b) => a.distance - b.distance);
    }

    return result.slice(0, 50);
  }, [searchQuery, bikeData, userLocation]);

  /* 渲染 */
  const renderItem = ({ item }: { item: any }) => (
    <Box style={styles.card}>
      <VStack space="xs">
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={styles.title}>
            {item.sna.replace("YouBike2.0_", "")}
          </Text>
          <Text style={styles.distance}>
            {item.distance ? `${item.distance.toFixed(2)} km` : "-- km"}
          </Text>
        </HStack>

        <Text style={styles.address}>{item.ar}</Text>

        <HStack space="md" mt="$2">
          <HStack space="xs" alignItems="center">
            <Box style={styles.yellowBadge}>
              <FontAwesome name="bicycle" size={13} color="white" />
            </Box>
            <Text style={styles.count}>可借 {item.rent}</Text>
          </HStack>

          <HStack space="xs" alignItems="center">
            <Box style={styles.redBadge}>
              <FontAwesome name="undo" size={13} color="white" />
            </Box>
            <Text style={styles.count}>可還 {item.ret}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box style={styles.container}>

      {/* 精緻化搜尋欄 */}
      <Box style={styles.searchWrapper}>
        <Input
          variant="outline"
          size="sm"
          borderRadius="$full"
          style={styles.searchInput}
        >
          <InputSlot pl="$3">
            <InputIcon as={SearchIcon} />
          </InputSlot>

          <InputField
            placeholder="搜尋站點名稱或地址"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.font}
          />
        </Input>
      </Box>

      {isLoading ? (
        <Center style={{ flex: 1 }}>
          <Spinner size="large" />
          <Text style={[styles.font, { marginTop: 8 }]}>
            計算最近站點中...
          </Text>
        </Center>
      ) : (
        <FlatList
          data={filteredStations}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.sno}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Center mt="$10">
              <Text style={styles.font}>找不到相關站點</Text>
            </Center>
          }
        />
      )}
    </Box>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  font: {
    fontFamily: 'ZenKurenaido_400Regular',
  },

  searchWrapper: {
    marginBottom: 12,
  },

  searchInput: {
    backgroundColor: '#ffffff',
    height: 44,          // ⭐ 搜尋欄高度縮小
    paddingHorizontal: 6,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontFamily: 'ZenKurenaido_400Regular',
  },

  distance: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'ZenKurenaido_400Regular',
  },

  address: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'ZenKurenaido_400Regular',
  },

  count: {
    fontSize: 13,
    fontFamily: 'ZenKurenaido_400Regular',
  },

  yellowBadge: {
    backgroundColor: '#FDD835',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  redBadge: {
    backgroundColor: '#E57373',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});