import { Injectable } from '@nestjs/common';
import { LoginDTO, OtpDTO, SignupDTO } from './dtos';
import { AuthenticatedUser } from './interface';
import * as owasp from 'owasp-password-strength-test';
import { AccountWasDeleted, PasswordIsWeak } from './errors';
import { sign, verify } from 'jsonwebtoken';
import { User } from 'src/users/entities';
import { AccountState, UsersService } from '../users';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) // private readonly loginAuditService: LoginAuditService,
  {}

  private verifyPasswordStrength(password: string) {
    const testResult = owasp.test(password);

    if (testResult.errors.length) {
      throw new PasswordIsWeak(testResult.errors);
    }
  }

  /**
   * signUp
   */
  public async signUp(signupDTO: SignupDTO): Promise<AuthenticatedUser> {
    console.log('herrrr');
    this.verifyPasswordStrength(signupDTO.password);

    const user = await this.usersService.createUser(signupDTO);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      salt: user.salt,
    };
  }

  public async emailVerify(otpDTO: any){
    return await this.usersService.emailVerification(otpDTO)
  }

  public async login(loginDTO: LoginDTO) {
    return await this.usersService.loginUser(loginDTO);
  }

  public async sendEmailForgotPassword(email: string): Promise<boolean>{
    return await this.usersService.requestPasswordReset(email)
  }

  public async resetPassword(resetToken: string, newPassword: string): Promise<void>{
    return await this.usersService.resetPassword(resetToken, newPassword)
  }

}
