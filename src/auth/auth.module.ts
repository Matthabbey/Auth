import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
