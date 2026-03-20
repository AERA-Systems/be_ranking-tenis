import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { UserRole } from '../database/enums';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async countUsers() {
    return this.userRepo.count();
  }

  async list(): Promise<SafeUser[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getById(id: string): Promise<SafeUser> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario não encontrado.');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    await this.ensureUsernameAvailable(dto.username);

    const created = this.userRepo.create({
      name: dto.name,
      username: dto.username,
      passwordHash: this.hashPassword(dto.password),
      active: dto.active ?? true,
      role: dto.role ?? UserRole.ADMIN,
    });

    const saved = await this.userRepo.save(created);
    return this.toSafeUser(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        passwordHash: true,
        active: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario não encontrado.');
    }

    if (dto.username && dto.username !== user.username) {
      await this.ensureUsernameAvailable(dto.username, id);
    }

    user.name = dto.name ?? user.name;
    user.username = dto.username ?? user.username;
    user.active = dto.active ?? user.active;
    user.role = dto.role ?? user.role;

    if (dto.password) {
      user.passwordHash = this.hashPassword(dto.password);
    }

    const saved = await this.userRepo.save(user);
    return this.toSafeUser(saved);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario não encontrado.');
    }

    await this.userRepo.remove(user);
    return { ok: true };
  }

  async findForAuth(username: string) {
    return this.userRepo.findOne({
      where: { username, active: true },
      select: {
        id: true,
        name: true,
        username: true,
        passwordHash: true,
        active: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  verifyPassword(password: string, passwordHash: string) {
    const [salt, storedHash] = passwordHash.split(':');
    if (!salt || !storedHash) {
      return false;
    }

    const computedHash = scryptSync(password, salt, 64).toString('hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');

    if (storedBuffer.length !== computedBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, computedBuffer);
  }

  private async ensureUsernameAvailable(username: string, ignoreId?: string) {
    const existingUser = await this.userRepo.findOne({ where: { username } });
    if (existingUser && existingUser.id !== ignoreId) {
      throw new BadRequestException('Já existe usuario com esse username.');
    }
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
