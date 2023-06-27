import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthMiddleware } from '../middlewares';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})

// export class UsersModule {}
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(AuthMiddleware).forRoutes(UsersController);
  }
}
