import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './types/jwt-payload.type';
import { MeResponseDto } from '../dtos/auth.dto';

interface SignupParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup({
    email,
    password,
    name,
    phone,
    userType,
  }: SignupParams & { userType: UserType }) {
    const isUserExisted = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isUserExisted) throw new HttpException('User already exists', 401);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        userType,
      },
    });

    return this.generateToken(user);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new HttpException('Invalid credentials', 401);

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) throw new HttpException('Invalid credentials', 401);

    return this.generateToken(user);
  }

  private generateToken(user: { id: number; email: string }) {
    return this.jwt.signAsync({
      id: user.id,
      email: user.email,
    });
  }

  me(user: IJwtPayload) {
    return new MeResponseDto(user);
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }
}
