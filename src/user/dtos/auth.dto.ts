import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserType } from 'generated/prisma/enums';
import { IJwtPayload } from '../auth/types/jwt-payload.type';
import { Exclude, Expose } from 'class-transformer';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Matches(/^\+?(\d{1,3})?[-.\s]?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/, {
    message: 'Phone number must be a valid format',
  })
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class ProductKeyDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserType)
  userType!: UserType;
}

@Exclude()
export class MeResponseDto implements IJwtPayload {
  @Expose()
  email!: string;
  @Expose()
  id!: number;
  @Expose({ name: 'role', toPlainOnly: true })
  userType!: UserType;

  constructor(partial: Partial<MeResponseDto>) {
    Object.assign(this, partial);
  }
}
