import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { equipmentService } from '../../services/equipment.service';
import EquipmentCard from '../../components/EquipmentCard';
import { useLocation } from '../../hooks/useLocation';

export default function SearchScreen() {
  const navigation = useNavigation();
  const { location, loading: locationLoading } = useLocation();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const equipmentTypes = [
    { label: 'All', value: null },
    { label: 'Tractors', value: 'tractor' },
    { label: 'Harvesters', value: 'harvester' },
    { label: 'Drones', value: 'drone' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    fetchEquipment();
  }, [location, selectedType]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.searchNearby({
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        equipmentType: selectedType,
        radius: 50,
      });
      setEquipment(data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentPress = (item: any) => {
    navigation.navigate('EquipmentDetail', { equipmentId: item.id });
  };

  if (locationLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Finding equipment near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or model..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={equipmentTypes}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedType === item.value && styles.filterTabActive,
              ]}
              onPress={() => setSelectedType(item.value)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedType === item.value && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Equipment List */}
      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EquipmentCard equipment={item} onPress={() => handleEquipmentPress(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Icon name="tractor" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No equipment found nearby</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterTabActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});