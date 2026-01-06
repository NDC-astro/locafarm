import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment, EquipmentStatus } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async create(ownerId: string, createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const { latitude, longitude, ...rest } = createEquipmentDto;

    const equipment = this.equipmentRepository.create({
      ...rest,
      ownerId,
      location: `POINT(${longitude} ${latitude})`,
      primaryPhotoUrl: null, // Will be set when photos are uploaded
    });

    return await this.equipmentRepository.save(equipment);
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      equipmentType?: string;
      ownerId?: string;
      isActive?: boolean;
    },
  ): Promise<{ data: Equipment[]; total: number }> {
    const query = this.equipmentRepository
      .createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.owner', 'owner')
      .where('equipment.deletedAt IS NULL');

    if (filters?.equipmentType) {
      query.andWhere('equipment.equipmentType = :equipmentType', {
        equipmentType: filters.equipmentType,
      });
    }

    if (filters?.ownerId) {
      query.andWhere('equipment.ownerId = :ownerId', { ownerId: filters.ownerId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('equipment.isActive = :isActive', { isActive: filters.isActive });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('equipment.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return equipment;
  }

  async findByOwner(ownerId: string): Promise<Equipment[]> {
    return await this.equipmentRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    ownerId: string,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    const equipment = await this.findOne(id);

    if (equipment.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own equipment');
    }

    if (updateEquipmentDto.latitude && updateEquipmentDto.longitude) {
      equipment.location = `POINT(${updateEquipmentDto.longitude} ${updateEquipmentDto.latitude})`;
      delete updateEquipmentDto.latitude;
      delete updateEquipmentDto.longitude;
    }

    Object.assign(equipment, updateEquipmentDto);
    return await this.equipmentRepository.save(equipment);
  }

  async updatePhotos(id: string, ownerId: string, photoUrls: string[]): Promise<Equipment> {
    const equipment = await this.findOne(id);

    if (equipment.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own equipment');
    }

    equipment.photos = photoUrls;
    equipment.primaryPhotoUrl = photoUrls[0] || null;

    return await this.equipmentRepository.save(equipment);
  }

  async updateStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
    const equipment = await this.findOne(id);
    equipment.status = status;
    return await this.equipmentRepository.save(equipment);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const equipment = await this.findOne(id);

    if (equipment.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own equipment');
    }

    await this.equipmentRepository.softRemove(equipment);
  }

  async updateRating(id: string, rating: number): Promise<void> {
    const equipment = await this.findOne(id);
    const totalBookings = equipment.totalBookings || 1;
    const newRating = (equipment.averageRating * (totalBookings - 1) + rating) / totalBookings;
    
    equipment.averageRating = newRating;
    await this.equipmentRepository.save(equipment);
  }
}