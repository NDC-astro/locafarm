import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking request' })
  create(@CurrentUser() user: any, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(user.userId, createBookingDto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get user bookings (as renter)' })
  getMyBookings(@CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.bookingsService.findAll(user.userId, 'renter', page, limit);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get booking requests (as owner)' })
  getMyRequests(@CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.bookingsService.findAll(user.userId, 'owner', page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve booking (owner only)' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('ownerResponse') ownerResponse?: string,
  ) {
    return this.bookingsService.approve(id, user.userId, ownerResponse);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject booking (owner only)' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('ownerResponse') ownerResponse: string,
  ) {
    return this.bookingsService.reject(id, user.userId, ownerResponse);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason: string) {
    return this.bookingsService.cancel(id, user.userId, reason);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed' })
  complete(@Param('id') id: string) {
    return this.bookingsService.complete(id);
  }

  @Get('equipment/:equipmentId/availability')
  @ApiOperation({ summary: 'Get equipment availability calendar' })
  getAvailability(
    @Param('equipmentId') equipmentId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.bookingsService.getCalendarAvailability(equipmentId, month, year);
  }
}
