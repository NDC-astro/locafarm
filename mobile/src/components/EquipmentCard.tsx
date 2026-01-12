import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EquipmentCardProps {
  equipment: any;
  onPress: () => void;
}

export default function EquipmentCard({ equipment, onPress }: EquipmentCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri: equipment.primaryPhotoUrl || 'https://via.placeholder.com/300x200?text=No+Image',
        }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {equipment.title}
        </Text>
        <Text style={styles.type}>{equipment.equipmentType.replace('_', ' ')}</Text>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${equipment.dailyRate}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFC107" />
            <Text style={styles.rating}>
              {equipment.averageRating > 0 ? equipment.averageRating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {equipment.city}, {equipment.state}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#10B981',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
});
