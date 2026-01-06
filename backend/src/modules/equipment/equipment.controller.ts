import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.BOTH, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create equipment listing' })
  create(@CurrentUser() user: any, @Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(user.userId, createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment listings' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('type') equipmentType?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.equipmentService.findAll(page, limit, { equipmentType, ownerId });
  }

  @Get('my-equipment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user equipment listings' })
  findMyEquipment(@CurrentUser() user: any) {
    return this.equipmentService.findByOwner(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.BOTH, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update equipment listing' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, user.userId, updateEquipmentDto);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload equipment photos' })
  async uploadPhotos(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // TODO: Upload to S3 and get URLs
    const photoUrls = files.map((file) => `https://s3.amazonaws.com/equipment/${file.filename}`);
    return this.equipmentService.updatePhotos(id, user.userId, photoUrls);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete equipment listing' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.equipmentService.remove(id, user.userId);
  }
}