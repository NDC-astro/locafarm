import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../equipment/entities/equipment.entity';

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  equipmentType?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async searchNearby(params: SearchParams) {
    const {
      latitude,
      longitude,
      radius = 50, // Default 50km
      equipmentType,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = params;

    let query = this.equipmentRepository
      .createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.owner', 'owner')
      .where('equipment.isActive = :isActive', { isActive: true })
      .andWhere('equipment.deletedAt IS NULL')
      .andWhere(
        `ST_DWithin(
          equipment.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        { latitude, longitude, radius: radius * 1000 }, // Convert km to meters
      );

    // Add distance calculation
    query = query.addSelect(
      `ST_Distance(
        equipment.location::geography,
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
      ) / 1000`,
      'distance',
    );

    if (equipmentType) {
      query = query.andWhere('equipment.equipmentType = :equipmentType', { equipmentType });
    }

    if (minPrice !== undefined) {
      query = query.andWhere('equipment.dailyRate >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query = query.andWhere('equipment.dailyRate <= :maxPrice', { maxPrice });
    }

    // TODO: Add availability check against bookings
    // if (startDate && endDate) {
    //   query = query.andWhere(...);
    // }

    const [data, total] = await query
      .orderBy('distance', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMapMarkers(latitude: number, longitude: number, radius = 100) {
    const equipment = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .select([
        'equipment.id',
        'equipment.title',
        'equipment.equipmentType',
        'equipment.dailyRate',
        'equipment.primaryPhotoUrl',
        'ST_AsGeoJSON(equipment.location) as location',
      ])
      .where('equipment.isActive = :isActive', { isActive: true })
      .andWhere('equipment.deletedAt IS NULL')
      .andWhere(
        `ST_DWithin(
          equipment.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius
        )`,
        { latitude, longitude, radius: radius * 1000 },
      )
      .getRawMany();

    return equipment.map((item) => ({
      ...item,
      location: JSON.parse(item.location),
    }));
  }
}