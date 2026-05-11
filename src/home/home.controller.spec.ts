import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  const homeServiceMock = {
    getHomes: jest.fn().mockReturnValue([]),
    getHome: jest.fn(),
    createHome: jest.fn(),
    updateHome: jest.fn(),
    deleteHome: jest.fn(),
    inquire: jest.fn(),
    getHomeMessages: jest.fn(),
  };

  const jwtGuardMock = {
    canActivate: jest.fn(() => true),
  };

  const rolesGuardMock = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: homeServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('filter object check', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '1500000');

      expect(mockGetHomes).toHaveBeenCalledWith({
        city: 'Toronto',
        price: {
          gte: 1500000,
        },
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
