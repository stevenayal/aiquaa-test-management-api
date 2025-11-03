import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async create(data: { email: string; passwordHash: string; role: UserRole; emailVerified?: boolean }) {
    return this.prisma.user.create({
      data,
    });
  }

  async verifyEmail(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }

  async updatePassword(email: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }
}
