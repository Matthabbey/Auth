import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDTO, OtpDTO, SignupDTO } from './dtos';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

@ApiTags("auth")
@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  // @ApiProduces('application/json')
  @ApiInternalServerErrorResponse({description: "Expectation Failed Here", status: 417})
  @ApiCreatedResponse()
  @Post('signup')
  async onUserSignUp(@Body() signupDTO: SignupDTO) {
    return this.authService.signUp(signupDTO);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @Post('email/verify')
  async verifyEmail(@Req() req: Request, @Body('otp') otp: OtpDTO) {
    return this.authService.emailVerify(otp, req);
  }

  
  @HttpCode(200)
  @Post('login')
  async onUserLogin(
    @Body() loginDTO: LoginDTO
    ) {
    return await this.authService.login(loginDTO);
  }

}
