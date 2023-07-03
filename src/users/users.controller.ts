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
  Patch,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CahngeAccountStatusDTO, UpdateUserDTO } from './dtos';
import { AccountState } from './account-state';
import { User } from './entities';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiInternalServerErrorResponse()
  @ApiUnauthorizedResponse()
  @ApiOkResponse({ type: User })
  @HttpCode(200)
  @Get('all')
  async onGetUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get('user')
  async findOneUser(@Body() body: any) {
    return this.usersService.findUserByEmail(body);
  }

  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Patch('update-profile')
  async updateProfile(@Req() req: Request, @Body() update: UpdateUserDTO) {
    console.log('Hello', req.user);
    return this.usersService.updateUserProfile(req, update);
  }
}
