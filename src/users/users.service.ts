import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';

import { JwtService } from '@nestjs/jwt';
import { UpdateUserDTO } from './dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

   async findUserByEmail(req: any) {
    try {
      const data = req.user;

      if (!data) {
        throw new NotFoundException();
      }

      const user = await this.userRepository.findOne(data.email);
      if (!user) {
        throw new NotFoundException();
      }

      const { password, resetToken, salt, ...result } = user;

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

   async updateUserProfile(
    find: any,
    update: UpdateUserDTO,
  ): Promise<any> {
    try {
      console.log(find.user.userId);
      const id = find.user.userId;
      const user = await this.userRepository.findOne({ where: { id: id } });

      if (!user) {
        return {
          Error: 'You are not authorized to update your profile',
        };
      }
      const { firstName, lastName, phoneNumber, dateOfBirth } = update;

      const updatedUser = await this.userRepository
        .createQueryBuilder()
        .update(user)
        .set({ firstName, lastName, phoneNumber, dateOfBirth }) // Specify the updated values using the set method
        .where({ id })
        .execute();

      if (updatedUser.affected === 0) {
        throw new NotFoundException('User not found');
      }

      const updated = await this.userRepository.findOne({ where: { id } });

      return { message: 'Successfully updated', succ: updated };
    } catch (error) {
      // throw new Error(error);
      return {
        Error: `Internal server ${error}`,
        throw: new Error(error),
        route: 'users/update-user-profile',
      };
    }
  }
}
