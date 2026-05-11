import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from 'generated/prisma/enums';
import { IJwtPayload } from 'src/user/auth/types/jwt-payload.type';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prisma.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        numberOfBathrooms: true,
        numberOfBedrooms: true,
        images: { select: { url: true }, take: 1 },
      },
      where: filters,
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map((home) => {
      return new HomeResponseDto(home);
    });
  }

  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.prisma.home.findUnique({ where: { id } });
    if (!home) throw new NotFoundException();
    return new HomeResponseDto(home);
  }

  async createHome({ images, ...data }: CreateHomeParams, userId: number) {
    const home = await this.prisma.home.create({
      data: {
        ...data,
        realtorId: userId,
      },
    });

    const homeImages = images.map((image) => ({ ...image, homeId: home.id }));

    await this.prisma.image.createMany({
      data: homeImages,
    });

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, data: UpdateHomeParams, ownerId: number) {
    const home = await this.prisma.home.findUnique({
      where: { id },
    });

    if (!home) throw new NotFoundException('Home not found');

    if (home.realtorId !== ownerId)
      throw new ForbiddenException('You do not have access to this home');

    const updatedHome = await this.prisma.home.update({
      where: { id },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number, ownerId: number) {
    const home = await this.prisma.home.findUnique({
      where: { id, realtorId: ownerId },
    });

    if (!home) throw new NotFoundException();

    await this.prisma.image.deleteMany({
      where: {
        homeId: home.id,
      },
    });

    await this.prisma.home.delete({
      where: { id },
    });

    return {
      message: 'Home deleted successfully',
    };
  }

  async inquire(buyer: IJwtPayload, homeId: number, message: string) {
    const home = await this.prisma.home.findUnique({
      where: {
        id: homeId,
      },
    });

    if (!home) throw new NotFoundException('Home is not found');

    const realtorId = home.realtorId;

    const newMessage = await this.prisma.message.create({
      data: {
        realtorId,
        buyerId: buyer.id,
        homeId,
        message,
      },
    });

    return newMessage;
  }

  async getMessagesByHome(realtor: IJwtPayload, homeId: number) {
    const home = await this.prisma.home.findUnique({
      where: {
        id: homeId,
      },
    });

    if (!home) throw new NotFoundException('Home is not found');

    const messages = await this.prisma.message.findMany({
      where: {
        homeId: home.id,
        realtorId: realtor.id,
      },
      select: {
        message: true,
        buyer: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return messages;
  }
}
