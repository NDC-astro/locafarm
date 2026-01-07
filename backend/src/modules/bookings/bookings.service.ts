import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EquipmentService } from '../equipment/equipment.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private equipmentService: EquipmentService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(renterId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const equipment = await this.equipmentService.findOne(createBookingDto.equipmentId);

    if (equipment.ownerId === renterId) {
      throw new BadRequestException('You cannot book your own equipment');
    }

    if (!equipment.isActive) {
      throw new BadRequestException('This equipment is not available for booking');
    }

    // Check for conflicting bookings
    const hasConflict = await this.checkBookingConflict(
      createBookingDto.equipmentId,
      new Date(createBookingDto.startDate),
      new Date(createBookingDto.endDate),
    );

    if (hasConflict) {
      throw new BadRequestException('Equipment is not available for the selected dates');
    }

    // Calculate pricing
    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    if (durationHours < equipment.minimumRentalHours) {
      throw new BadRequestException(`Minimum rental period is ${equipment.minimumRentalHours} hours`);
    }

    const durationDays = Math.ceil(durationHours / 24);
    const totalAmount = equipment.dailyRate * durationDays;
    const platformFeePercentage = parseFloat(this.configService.get('PLATFORM_FEE_PERCENTAGE', '12'));
    const platformFee = (totalAmount * platformFeePercentage) / 100;
    const ownerPayout = totalAmount - platformFee;

    const booking = this.bookingsRepository.create({
      renterId,
      ownerId: equipment.ownerId,
      equipmentId: equipment.id,
      startDate,
      endDate,
      durationHours,
      hourlyRate: equipment.hourlyRate,
      dailyRate: equipment.dailyRate,
      totalAmount,
      depositAmount: equipment.depositAmount,
      platformFee,
      ownerPayout,
      renterNotes: createBookingDto.renterNotes,
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    // Emit event for notification
    this.eventEmitter.emit('booking.created', {
      bookingId: savedBooking.id,
      ownerId: equipment.ownerId,
      renterId,
    });

    return savedBooking;
  }

  async findAll(
    userId: string,
    role: 'renter' | 'owner',
    page = 1,
    limit = 10,
  ): Promise<{ data: Booking[]; total: number }> {
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.equipment', 'equipment')
      .leftJoinAndSelect('booking.renter', 'renter')
      .leftJoinAndSelect('booking.owner', 'owner');

    if (role === 'renter') {
      query.where('booking.renterId = :userId', { userId });
    } else {
      query.where('booking.ownerId = :userId', { userId });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['equipment', 'renter', 'owner'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async approve(id: string, ownerId: string, ownerResponse?: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Only the equipment owner can approve this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    booking.status = BookingStatus.APPROVED;
    booking.approvedAt = new Date();
    booking.ownerResponse = ownerResponse;

    const updatedBooking = await this.bookingsRepository.save(booking);

    // Emit event for payment processing
    this.eventEmitter.emit('booking.approved', {
      bookingId: booking.id,
      renterId: booking.renterId,
      totalAmount: booking.totalAmount + booking.depositAmount,
    });

    return updatedBooking;
  }

  async reject(id: string, ownerId: string, ownerResponse: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Only the equipment owner can reject this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    booking.status = BookingStatus.REJECTED;
    booking.rejectedAt = new Date();
    booking.ownerResponse = ownerResponse;

    return await this.bookingsRepository.save(booking);
  }

  async cancel(id: string, userId: string, reason: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.renterId !== userId && booking.ownerId !== userId) {
      throw new ForbiddenException('Only booking participants can cancel');
    }

    if (![BookingStatus.PENDING, BookingStatus.APPROVED].includes(booking.status)) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    const updatedBooking = await this.bookingsRepository.save(booking);

    // Emit event for refund processing
    if (booking.paymentStatus === PaymentStatus.PAID) {
      this.eventEmitter.emit('booking.cancelled', {
        bookingId: booking.id,
        renterId: booking.renterId,
        refundAmount: booking.totalAmount + booking.depositAmount,
      });
    }

    return updatedBooking;
  }

  async markAsActive(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    
    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Only approved bookings can be activated');
    }

    booking.status = BookingStatus.ACTIVE;
    booking.startedAt = new Date();

    await this.equipmentService.updateStatus(booking.equipmentId, 'rented' as any);

    return await this.bookingsRepository.save(booking);
  }

  async complete(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.ACTIVE) {
      throw new BadRequestException('Only active bookings can be completed');
    }

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();

    await this.equipmentService.updateStatus(booking.equipmentId, 'available' as any);

    const updatedBooking = await this.bookingsRepository.save(booking);

    // Emit event for payout processing
    this.eventEmitter.emit('booking.completed', {
      bookingId: booking.id,
      ownerId: booking.ownerId,
      payoutAmount: booking.ownerPayout,
    });

    return updatedBooking;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.paymentStatus = paymentStatus;
    return await this.bookingsRepository.save(booking);
  }

  private async checkBookingConflict(
    equipmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const conflictingBooking = await this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.equipmentId = :equipmentId', { equipmentId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.APPROVED, BookingStatus.ACTIVE],
      })
      .andWhere(
        '(booking.startDate <= :endDate AND booking.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getOne();

    return !!conflictingBooking;
  }

  async getCalendarAvailability(equipmentId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await this.bookingsRepository.find({
      where: {
        equipmentId,
        status: Between(BookingStatus.APPROVED, BookingStatus.ACTIVE),
        startDate: Between(startDate, endDate),
      },
      select: ['startDate', 'endDate'],
    });

    return bookings.map((booking) => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));
  }
}
