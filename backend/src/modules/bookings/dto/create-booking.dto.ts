import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  equipmentId: string;

  @ApiProperty({ example: '2024-02-01T08:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-02-03T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Need for plowing 10 acres', required: false })
  @IsOptional()
  @IsString()
  renterNotes?: string;
}