import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../services/app.config.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '../services/token.service';
import { HashingService } from '../services/hashing.service';

const sharedServices = [AppConfigService, TokenService, HashingService];

@Global()
@Module({
  imports: [JwtModule],
  providers: [...sharedServices],
  exports: [...sharedServices],
})
export class SharedModule {}
