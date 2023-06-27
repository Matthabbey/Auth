import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities';
import { LoginDTO } from 'src/auth/dtos';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(loginDTO: LoginDTO) {
    const user = await this.authService.login(loginDTO);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}