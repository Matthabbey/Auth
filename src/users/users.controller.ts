import {
  Body,
  Controller,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Get,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dtos';
import { User } from './entities';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
  async onGetUsers(@Req() res: Request): Promise<User[]> {
    return this.usersService.getAllUsers();
  }


  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get('user')
  async findOneUser(@Req() req: Request) {
    return this.usersService.findUserByEmail(req);
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
