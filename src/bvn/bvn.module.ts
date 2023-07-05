import { Global, Module } from '@nestjs/common';
import { BvnService } from './bvn.service';
import { BvnController } from './bvn.controller';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    imports: [   JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {expiresIn: '3m'}
    })],
  providers: [BvnService],
  controllers: [BvnController],
})
export class BvnModule {}
