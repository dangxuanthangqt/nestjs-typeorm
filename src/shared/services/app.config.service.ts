import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import TypeOrmCustomLogger from '../utilities/typeorm-custom-logger';
import { LoggerOptions } from 'typeorm';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [
      __dirname + '/../../**/*.entity{.ts,.js}',
      __dirname + '/../../**/*.view-entity{.ts,.js}',
    ];
    const migrations = [__dirname + '/../../database/migrations/*{.ts,.js}'];

    return Object.freeze({
      entities,
      migrations,
      keepConnectionAlive: !this.isTest,
      dropSchema: this.isTest,
      type: 'postgres',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_NAME'),
      //   extra: {
      //     ssl: this.getBoolean('DB_USE_SSL'),
      //     charset: 'utf8mb4_general_ci',
      //   },
      logger: TypeOrmCustomLogger.getInstance(
        'default',
        this.getArray('ENABLE_ORM_LOGS') as LoggerOptions,
      ),
      migrationsRun: false,
    });
  }

  private getArray(key: string): string[] {
    const value = this.get(key);

    try {
      return this.parseArray(value);
    } catch {
      throw new Error(
        `AppConfigService: ${key} is not a array (value1,value2,value3,...)`,
      );
    }
  }

  private parseArray(value: string): string[] {
    const items = value.split(',').map((item) => item.trim());

    if (items.includes('')) {
      throw new Error('AppConfigService: Array contains empty values');
    }

    return items;
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  private getString(key: string): string {
    const value = this.get(key);
    return value.replaceAll('\\n', '\n');
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    if (isNaN(Number(value))) {
      throw new Error(`AppConfigService: ${key} is not a number`);
    }

    return Number(value);
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(`AppConfigService: ${key} is not a boolean`);
    }
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(`AppConfigService: ${key} is not defined`);
    }

    return value;
  }
}
