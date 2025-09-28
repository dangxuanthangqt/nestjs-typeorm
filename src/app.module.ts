import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './shared/modules/base.module';
import { SharedModule } from './shared/modules/shared.module';
import { AuthModule } from './api/auth/auth.module';

@Module({
  imports: [BaseModule, SharedModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
