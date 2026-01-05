import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'SecureP@ssw0rd', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Farmer' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OWNER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'Houston', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Texas', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;
}