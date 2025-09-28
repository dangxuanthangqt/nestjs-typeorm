import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsPasswordMatch } from 'src/shared/decorators/validations/match-password.decorator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters.' })
  password: string;

  @IsString()
  @IsPasswordMatch('password', {
    message: 'Confirm password must match password.',
  })
  confirmPassword: string;

  @IsString()
  @Length(2, 50, {
    message: 'Name must be between 2 and 50 characters.',
  })
  name: string;
}

export class RegisterResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters.' })
  password: string;
}

export class LoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  constructor(partial: Partial<RefreshTokenResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LogoutResponseDto {
  @Expose()
  message: string;

  constructor(partial: Partial<LogoutResponseDto>) {
    Object.assign(this, partial);
  }
}

export class MeResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  posts: {
    id: number;
    title: string;
    content: string;
  }[];

  constructor(partial: Partial<MeResponseDto>) {
    Object.assign(this, partial);
  }
}
