import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth';
import { User } from './users/entities';
import { UsersController } from './users';
import * as dotenv from 'dotenv'
import { JwtModule } from '@nestjs/jwt';
import { BvnModule } from './bvn/bvn.module';
dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    BvnModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '3m'}
  })
    
  ],
  controllers: [UsersController]
})
export class AppModule {}
