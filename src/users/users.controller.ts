import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
  Get
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CahngeAccountStatusDTO } from './dtos';
import { AccountState } from './account-state';
import { User } from './entities';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @HttpCode(200)
  @Get('all')
  async onGetUsers (): Promise<User[]>{
    return this.usersService.getAllUsers()
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
