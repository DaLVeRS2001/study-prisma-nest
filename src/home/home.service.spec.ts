import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from 'generated/prisma/enums';
import { NotFoundException } from '@nestjs/common';

const mockHome = {
  id: 1,
  address: '23445 Bebi Str',
  numberOfBedrooms: 1,
  numberOfBathrooms: 1,
  city: 'New-York',
  price: 500000,
  propertyType: PropertyType.RESIDENTIAL,
  images: [
    {
      url: 'src1',
    },
  ],
};

const mockGetHomes = [mockHome];

const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  { id: 2, url: 'src2' },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  const prismaMock = {
    home: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockReturnValue(mockGetHomes),
      update: jest.fn(),
      delete: jest.fn(),
    },
    image: {
      createMany: jest.fn().mockReturnValue(mockImages),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 100000,
        lte: 150000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };
    it('call home.findMany', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toHaveBeenCalledWith({
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
    });

    it('404 exception if no home are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '111 Yellow Str',
      numberOfBedrooms: 2,
      numberOfBathrooms: 2,
      city: 'Vancouver',
      price: 3000000,
      landSize: 444,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };
    it('should call prisma home.create', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateHome).toHaveBeenCalledWith({
        data: {
          address: '111 Yellow Str',
          numberOfBedrooms: 2,
          numberOfBathrooms: 2,
          city: 'Vancouver',
          price: 3000000,
          landSize: 444,
          propertyType: PropertyType.RESIDENTIAL,
          realtorId: 5,
        },
      });
    });

    it('should call prisma image.createMany', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateManyImage).toHaveBeenCalledWith({
        data: [
          {
            url: 'src1',
            homeId: 1,
          },
        ],
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
