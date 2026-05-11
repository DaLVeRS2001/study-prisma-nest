import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HomeService } from './home.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from './dto/home.dto';
import { PropertyType, UserType } from 'generated/prisma/enums';
import { User } from 'src/user/decorators/user.decorator';
import { Auth } from 'src/user/decorators/auth.decorator';
import { IJwtPayload } from 'src/user/auth/types/jwt-payload.type';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filters);
  }
  @Get(':id')
  getHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHome(id);
  }

  @Auth(UserType.REALTOR, UserType.ADMIN)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User('id') userId: number) {
    return this.homeService.createHome(body, userId);
  }

  @Auth(UserType.REALTOR, UserType.ADMIN)
  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User('id') userId: number,
  ) {
    return this.homeService.updateHome(id, body, userId);
  }

  @Auth(UserType.REALTOR, UserType.ADMIN)
  @Delete(':id')
  deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.homeService.deleteHome(id, userId);
  }

  @Auth(UserType.BUYER)
  @Post(':id/inquire')
  inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: IJwtPayload,
    @Body() { message }: InquireDto,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @Auth(UserType.REALTOR)
  @Get(':id/messages')
  getHomeMessages(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: IJwtPayload,
  ) {
    return this.homeService.getMessagesByHome(user, homeId);
  }
}
