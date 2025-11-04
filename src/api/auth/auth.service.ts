import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { ValidateException } from 'src/shared/exceptions/validate.exception';
import { AppConfigService } from 'src/shared/services/app.config.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { IsNull, Repository } from 'typeorm';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto/auth.dto';

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
        deletedAt: IsNull(),
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

  async refreshToken({
    refreshToken,
  }: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    const existingRefreshToken = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
      },
    });

    if (!existingRefreshToken)
      throw new UnauthorizedException("Refresh token isn't valid");

    try {
      const decodedRefreshToken =
        await this.tokenService.verifyRefreshToken(refreshToken);

      const $accessToken = this.tokenService.signAccessToken({
        payload: { userId: decodedRefreshToken.userId },
      });

      const newRefreshTokenExpire =
        decodedRefreshToken.exp - new Date().getTime() / 1000;

      const $newRefreshToken = this.tokenService.signRefreshToken({
        payload: { userId: decodedRefreshToken.userId },
        expiresIn: newRefreshTokenExpire,
      });

      const [accessToken, newRefreshToken] = await Promise.all([
        $accessToken,
        $newRefreshToken,
      ]);

      existingRefreshToken.token = newRefreshToken;
      await this.refreshTokenRepository.save(existingRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      await this.refreshTokenRepository.delete({
        token: refreshToken,
      });
      throw new UnauthorizedException('Refresh token expired');
    }
  }

  async login(body: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
        deletedAt: IsNull(),
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

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.refreshTokenRepository.save({
      // user: user, // Cần truy cập refreshToken.user ngay sau khi save
      userId: user.id, // nên dùng cách này, không cần cache relationship
      token: refreshToken,
      // expiresAt: plusDate(
      //   new Date(),
      //   this.appConfigService.jwtRefreshTokenExpirationTime as ms.StringValue,
      // ),

      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      createdBy: user.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
