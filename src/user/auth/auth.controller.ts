import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { ProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { UserType } from 'generated/prisma/enums';
import { User } from '../decorators/user.decorator';
import { IJwtPayload } from './types/jwt-payload.type';
import { Auth } from '../decorators/auth.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(['signup/:userType', 'signup'])
  async signup(
    @Body() body: SignupDto,
    @Param(
      'userType',
      new DefaultValuePipe(UserType.BUYER),
      new ParseEnumPipe(UserType),
    )
    userType: UserType = UserType.BUYER,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey)
        throw new UnauthorizedException(
          'Product key is required for non-buyer users',
        );

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProductKey) {
        throw new UnauthorizedException('Invalid product key');
      }
    }

    return this.authService.signup({ ...body, userType });
  }

  @Post('signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Auth()
  @Get('me')
  me(@User() user: IJwtPayload) {
    return this.authService.me(user);
  }

  @Auth(UserType.ADMIN)
  @Post('key')
  generateProductKey(@Body() body: ProductKeyDto) {
    return this.authService.generateProductKey(body.email, body.userType);
  }
}
