import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EquipmentType {
  TRACTOR = 'tractor',
  HARVESTER = 'harvester',
  PLOUGH = 'plough',
  SEEDER = 'seeder',
  SPRAYER = 'sprayer',
  DRONE = 'drone',
  IRRIGATION_SYSTEM = 'irrigation_system',
  TRAILER = 'trailer',
  CULTIVATOR = 'cultivator',
  OTHER = 'other',
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'equipment_type',
    type: 'enum',
    enum: EquipmentType,
  })
  equipmentType: EquipmentType;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ name: 'daily_rate', type: 'decimal', precision: 10, scale: 2 })
  dailyRate: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2 })
  depositAmount: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[];

  @Column({ name: 'primary_photo_url', nullable: true })
  primaryPhotoUrl: string;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.AVAILABLE,
  })
  status: EquipmentStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'minimum_rental_hours', type: 'int', default: 4 })
  minimumRentalHours: number;

  @Column({ name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
