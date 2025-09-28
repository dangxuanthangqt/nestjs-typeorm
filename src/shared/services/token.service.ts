import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from './app.config.service';
import { Injectable } from '@nestjs/common';

type TokenPayload = {
  userId: string;
};

type DecodedToken = TokenPayload & {
  iat: number;
  exp: number;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Signs a JWT access token with the provided payload and optional expiration time.
   * @param options - The token signing options
   * @param options.payload - The token payload containing user data
   * @param options.expiresIn - Optional custom expiration time for the token.
   *                            If not provided, uses the default access token expiration time from config
   * @returns A Promise that resolves to the signed JWT access token string
   *
   * @example
   * ```typescript
   * const accessToken = await tokenService.signToken({
   *   payload: { userId: '123', email: 'user@example.com' },
   *   expiresIn: '1h'
   * });
   * ```
   */
  signAccessToken({
    payload,
    expiresIn,
  }: {
    payload: TokenPayload;
    expiresIn?: string;
  }) {
    return this.jwtService.sign(payload, {
      secret: this.appConfigService.jwtAccessTokenSecret,
      expiresIn:
        expiresIn || this.appConfigService.jwtAccessTokenExpirationTime,
      algorithm: 'HS256',
    });
  }

  /**
   * Signs a JWT refresh token with the provided payload and optional expiration time.
   *
   * @param options - The token signing options
   * @param options.payload - The token payload containing user data
   * @param options.expiresIn - Optional custom expiration time for the token.
   *                            If not provided, uses the default refresh token expiration time from config
   * @returns A Promise that resolves to the signed JWT refresh token string
   *
   * @example
   * ```typescript
   * const refreshToken = await tokenService.signRefreshToken({
   *   payload: { userId: '123', email: 'user@example.com' },
   *   expiresIn: '7d'
   * });
   * ```
   */
  signRefreshToken({
    payload,
    expiresIn,
  }: {
    payload: TokenPayload;
    expiresIn?: string;
  }) {
    return this.jwtService.sign(payload, {
      secret: this.appConfigService.jwtRefreshTokenSecret,
      expiresIn:
        expiresIn || this.appConfigService.jwtRefreshTokenExpirationTime,
      algorithm: 'HS256',
    });
  }

  /**
   * Verifies an access token using JWT verification.
   *
   * @param token - The JWT access token string to verify
   * @returns A promise that resolves to the decoded token payload of type DecodedToken
   * @throws Will throw an error if the token is invalid, expired, or verification fails
   */
  verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync<DecodedToken>(token, {
      secret: this.appConfigService.jwtAccessTokenSecret,
    });
  }

  /**
   * Verifies the validity of a refresh token using JWT verification.
   *
   * @param token - The refresh token string to be verified
   * @returns A promise that resolves to the decoded token payload of type DecodedToken
   * @throws Will throw an error if the token is invalid, expired, or malformed
   */
  verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync<DecodedToken>(token, {
      secret: this.appConfigService.jwtRefreshTokenSecret,
    });
  }
}
