import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { equipmentService } from '../../services/equipment.service';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function EquipmentDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { equipmentId } = route.params as any;
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    fetchEquipment();
  }, [equipmentId]);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getById(equipmentId);
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigation.navigate('Booking', { equipment });
  };

  const handleContactOwner = () => {
    navigation.navigate('Chat', { ownerId: equipment.ownerId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!equipment) {
    return (
      <View style={styles.centered}>
        <Text>Equipment not found</Text>
      </View>
    );
  }

  const photos = equipment.photos || [equipment.primaryPhotoUrl];

  return (
    <ScrollView style={styles.container}>
      {/* Photo Gallery */}
      <View style={styles.photoContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentPhotoIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {photos.map((photo: string, index: number) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
        </ScrollView>
        <View style={styles.photoPagination}>
          {photos.map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentPhotoIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Title and Price */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{equipment.title}</Text>
            <Text style={styles.subtitle}>
              {equipment.brand} {equipment.model} • {equipment.year}
            </Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.price}>${equipment.dailyRate}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
        </View>

        {/* Rating and Location */}
        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={18} color="#FFC107" />
            <Text style={styles.ratingText}>
              {equipment.averageRating > 0 ? equipment.averageRating.toFixed(1) : 'New'}
            </Text>
            <Text style={styles.reviewCount}>({equipment.totalBookings} bookings)</Text>
          </View>
        </View>

        {/* Owner Info */}
        <View style={styles.ownerSection}>
          <Image
            source={{ uri: equipment.owner.avatarUrl || 'https://via.placeholder.com/50' }}
            style={styles.ownerAvatar}
          />
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{equipment.owner.fullName}</Text>
            <Text style={styles.ownerType}>Equipment Owner</Text>
          </View>
          <TouchableOpacity style={styles.messageButton} onPress={handleContactOwner}>
            <Icon name="chatbubble-outline" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{equipment.description}</Text>
        </View>

        {/* Specifications */}
        {equipment.specifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {Object.entries(equipment.specifications).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key.replace('_', ' ')}:</Text>
                <Text style={styles.specValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Location Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>{equipment.address}</Text>
          {/* Add MapView here if location coordinates available */}
        </View>

        {/* Rental Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Terms</Text>
          <View style={styles.termRow}>
            <Icon name="time-outline" size={20} color="#666" />
            <Text style={styles.termText}>Minimum rental: {equipment.minimumRentalHours} hours</Text>
          </View>
          <View style={styles.termRow}>
            <Icon name="card-outline" size={20} color="#666" />
            <Text style={styles.termText}>Security deposit: ${equipment.depositAmount}</Text>
          </View>
        </View>
      </View>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  photoContainer: {
    height: 300,
    position: 'relative',
  },
  photo: {
    width,
    height: 300,
  },
  photoPagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ownerType: {
    fontSize: 14,
    color: '#666',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specKey: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  address: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
  },
  bookButton: {
    backgroundColor: '#10B981',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
