import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { ValidateException } from 'src/shared/exceptions/validate.exception';
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
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
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
      // createdBy: '',
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
        deletedAt: IsNull(),
      },
    });

    if (!existingRefreshToken)
      throw new UnauthorizedException('Refresh token not found');

    try {
      const decodedRefreshToken =
        await this.tokenService.verifyRefreshToken(refreshToken);

      const $accessToken = this.tokenService.signAccessToken({
        payload: { userId: decodedRefreshToken.userId },
      });

      /** Calculate new refresh token expiration time that is equal to the old one */
      const newRefreshTokenExpire = Math.floor(
        decodedRefreshToken.exp - new Date().getTime() / 1000,
      );

      const $newRefreshToken = this.tokenService.signRefreshToken({
        payload: { userId: decodedRefreshToken.userId },
        expiresIn: newRefreshTokenExpire,
      });

      const [accessToken, newRefreshToken] = await Promise.all([
        $accessToken,
        $newRefreshToken,
      ]);

      // existingRefreshToken.token = newRefreshToken;
      // await this.refreshTokenRepository.save(existingRefreshToken);
      await this.refreshTokenRepository.update(
        { token: refreshToken },
        { token: newRefreshToken },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      await this.refreshTokenRepository.delete({
        token: refreshToken,
      });

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }

      throw new UnauthorizedException("Refresh token isn't valid");
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

    if (!isMatchedPassword || !user)
      throw new ValidateException("Email or password isn't correct. ");

    const $accessToken = this.tokenService.signAccessToken({
      payload: { userId: user.id },
    });

    const $refreshToken = this.tokenService.signRefreshToken({
      payload: { userId: user.id },
    });

    const [accessToken, refreshToken] = await Promise.all([
      $accessToken,
      $refreshToken,
    ]);

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    const result = await this.refreshTokenRepository.insert({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      createdBy: user.id,
    });
    console.log('result', result);
    // await this.refreshTokenRepository.save({
    //   // user: user, // Cần truy cập refreshToken.user ngay sau khi save
    //   userId: user.id, // nên dùng cách này, không cần cache relationship
    //   token: refreshToken,
    //   // expiresAt: plusDate(
    //   //   new Date(),
    //   //   this.appConfigService.jwtRefreshTokenExpirationTime as ms.StringValue,
    //   // ),

    //   expiresAt: new Date(decodedRefreshToken.exp * 1000),
    //   createdBy: user.id,
    // });

    return {
      accessToken,
      refreshToken,
    };
  }
}
