import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, Min, IsArray, IsBoolean } from 'class-validator';
import { EquipmentType } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'John Deere 5075E Tractor' })
  @IsString()
  title: string;

  @ApiProperty({ example: '75 HP utility tractor, excellent condition' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EquipmentType, example: EquipmentType.TRACTOR })
  @IsEnum(EquipmentType)
  equipmentType: EquipmentType;

  @ApiProperty({ example: 'John Deere' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: '5075E' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 2020 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ example: { horsepower: 75, fuel: 'diesel', transmission: 'manual' } })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({ example: 25.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty({ example: 29.7604 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -95.3698 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '123 Farm Road, Houston, TX 77001' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Houston' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Texas' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsNumber()
  minimumRentalHours?: number;
}
