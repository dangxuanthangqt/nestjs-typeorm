import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './shared/modules/base.module';
import { SharedModule } from './shared/modules/shared.module';

@Module({
  imports: [BaseModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
