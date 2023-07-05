import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDTO, OtpDTO, SignupDTO } from './dtos';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

@ApiTags("auth")
@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiCreatedResponse()
  @Post('signup')
  async onUserSignUp(@Body() signupDTO: SignupDTO, @Res() res: Response) {
    return this.authService.signUp(signupDTO, res);
  }


  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @HttpCode(200)
  @Post('email/verify')
  async verifyEmail(@Body() otp: OtpDTO) {
    return this.authService.emailVerify(otp);
  }

  @ApiBadRequestResponse()
  @ApiOkResponse()
  @Post('login')
  async onUserLogin(
    @Body() loginDTO: LoginDTO,
    @Res() res: Response
    ) {
    return await this.authService.login(loginDTO, res);
  }

}
