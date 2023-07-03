import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDTO, SignupDTO } from './dtos';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiEmailAlreadyExist, ApiInternalServerErrorResponse, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from './decorator';

@ApiTags("auth")
@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  // @ApiProduces('application/json')
  @ApiInternalServerErrorResponse({description: "Expectation Failed Here", status: 417})
  @HttpCode(201)
  @Post('signup')
  async onUserSignUp(@Body() signupDTO: SignupDTO) {
    return this.authService.signUp(signupDTO);
  }

  @HttpCode(200)
  @Post('email/verify')
  async verifyEmail(@Body('otp') otp: number) {
    return this.authService.emailVerify(otp);
  }

  
  @HttpCode(200)
  @Post('login')
  async onUserLogin(
    @Body() loginDTO: LoginDTO
    ) {
    return await this.authService.login(loginDTO);
  }

  

  @HttpCode(201)
  @Post('email/forgot-password')
  async sendEmailForgotPassword(@Body('email') email: string) {
    return await this.authService.sendEmailForgotPassword(email);
  }

  @HttpCode(201)
  @Post('email/reset-password')
  async resetPassword(
    @Param(':resetToken') params: any,
    @Body('email') newPassword: string,
  ) {
    return await this.authService.resetPassword(params.resetToken, newPassword);
  }
}
