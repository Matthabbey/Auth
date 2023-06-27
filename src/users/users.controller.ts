import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
  Get,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CahngeAccountStatusDTO } from './dtos';
import { AccountState } from './account-state';
import { User } from './entities';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(204)
  @Put(':id/account-deactivition')
  async onAccountDeactivition(
    @Param(':id') id: string,
    @Body() changeAccountStatusDTO: CahngeAccountStatusDTO,
  ) {
    await this.usersService.changeStatusAccount({
      id,
      ...changeAccountStatusDTO,
      state: AccountState.INACTIVE,
    });
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('all')
  async onGetUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findOneUser(@Req() request: any) {
    return this.usersService.findUserByEmail(request)
    }
  

  @HttpCode(204)
  @Delete(':id/account-deletion')
  async onAccountDeletion(
    @Param('id') id: string,
    @Body() changeAccountStatusDTO: CahngeAccountStatusDTO,
  ) {
    await this.usersService.changeStatusAccount({
      id,
      ...changeAccountStatusDTO,
      state: AccountState.DELETED,
    });
  }
}
