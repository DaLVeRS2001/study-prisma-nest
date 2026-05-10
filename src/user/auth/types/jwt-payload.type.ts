import { UserType } from 'generated/prisma/enums';

export interface IJwtPayload {
  id: number;
  email: string;
  userType: UserType;
}
