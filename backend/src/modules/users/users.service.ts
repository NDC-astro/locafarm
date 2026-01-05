import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async updateLocation(id: string, latitude: number, longitude: number): Promise<User> {
    const user = await this.findOne(id);
    user.location = `POINT(${longitude} ${latitude})`;
    return await this.usersRepository.save(user);
  }

  async uploadIdDocument(id: string, documentUrl: string): Promise<User> {
    const user = await this.findOne(id);
    user.idDocumentUrl = documentUrl;
    user.verificationStatus = 'pending' as any;
    return await this.usersRepository.save(user);
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.verificationStatus = 'verified' as any;
    user.idVerifiedAt = new Date();
    user.status = 'active' as any;
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async updateTrustScore(id: string, rating: number): Promise<void> {
    const user = await this.findOne(id);
    const newTotal = user.totalReviews + 1;
    const newScore = (user.trustScore * user.totalReviews + rating) / newTotal;
    
    user.trustScore = newScore;
    user.totalReviews = newTotal;
    await this.usersRepository.save(user);
  }
}