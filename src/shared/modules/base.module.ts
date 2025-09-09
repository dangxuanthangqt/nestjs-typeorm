import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../services/app.config.service';
import { SharedModule } from './shared.module';

const DBModule = TypeOrmModule.forRootAsync({
  imports: [SharedModule],
  useFactory: (appConfigService: AppConfigService) =>
    appConfigService.postgresConfig,
  inject: [AppConfigService],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }), // Register ConfigService to be used in AppConfigService
    DBModule,
  ],
})
export class BaseModule {}
