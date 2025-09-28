import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { AppConfigService } from 'src/shared/services/app.config.service';
import { TokenService } from 'src/shared/services/token.service';
import { Repository } from 'typeorm';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto/auth.dto';
import { HashingService } from 'src/shared/services/hashing.service';
import { ValidateException } from 'src/shared/exceptions/validate.exception';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';
import { plusDate } from 'src/shared/utilities/date-time.util';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async register(body: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });

    if (existingUser) throw new ValidateException('V002');

    const hashedPassword = this.hashingService.hashData(body.password);

    const newUser = await this.userRepository.save({
      email: body.email,
      name: body.name,
      password: hashedPassword,
      createdBy: '',
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async login(body: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });

    const isMatchedPassword = user
      ? this.hashingService.compareData(body.password, user.password)
      : false;

    if (!isMatchedPassword || !user) throw new ValidateException('V001');

    const accessTokenPromise = this.tokenService.signAccessToken({
      payload: { userId: user.id },
    });

    const refreshTokenPromise = this.tokenService.signRefreshToken({
      payload: { userId: user.id },
    });

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    await this.refreshTokenRepository.save({
      user: user,
      token: refreshToken,
      expiresAt: plusDate(
        new Date(),
        this.appConfigService.jwtRefreshTokenExpirationTime as ms.StringValue,
      ),
      createdBy: user.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
