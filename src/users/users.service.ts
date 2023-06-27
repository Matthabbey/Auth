import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities';
import { LoginDTO, SignupDTO } from 'src/auth/dtos';
import {
  CannotChangeToSameStateError,
  EmailIsTakenError,
  PasswordNotMatchError,
  UserNotFoundError,
} from './errors';
import {
  GeneratePassword,
  GenerateSalt,
  Generatesignature,
  emailHtml,
  generateOTP,
  mailSent,
  matchPassword,
} from './password-helper';
import { ChangeStatusRequest } from './interfaces/change-status-request.interface';
import { compare } from 'bcrypt';
import { AuthenticatedUser, ForgottenPassword } from 'src/auth/interface';
import nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  private async _findByAttr(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  private async _verifyUserPassword(password: string, inputPassword: string) {
    const passwordMatch = await matchPassword(password, inputPassword);

    if (!passwordMatch) {
      throw new PasswordNotMatchError();
    }
  }

  public async createUser(signupDTO: SignupDTO): Promise<AuthenticatedUser> {
    try {
      let user: any;
      const salt = await GenerateSalt();
      const otp = generateOTP();
      const userPassword = await GeneratePassword(signupDTO.password, salt);
      const existingUser = await this._findByAttr(signupDTO.email);
      if (existingUser) {
        throw new EmailIsTakenError();
      }
      if (!existingUser) {
        user = this.userRepository.create();
        user.email = signupDTO.email;
        user.firstName = signupDTO.firstName;
        user.lastName = signupDTO.lastName;
        user.password = userPassword;
        user.verified = false;
        user.salt = salt;
        user.otp = otp;

        const html = emailHtml(otp);

      await mailSent(process.env.ADMIN, signupDTO.email, process.env.USER, html);
        return this.userRepository.save(user);
        
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }

  public async emailVerification(token: number) {
    const verify = await this.userRepository.findOne({ where: { otp: token } });

    if (verify && verify.email && verify.id) {
      const user = await this.userRepository.findOne({
        where: { email: verify.email },
      });
      if (user) {
        user.verified = true;
        const userVerified = await this.userRepository.save(user);
        return user.email, user.otp;
      }
    } else {
      throw new HttpException(
        'LOGIN_EMAIL_CODE_NOT_VERIFIED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async loginUser(loginDTO: LoginDTO) {
    try {
      let signature: any;
      const user = await this._findByAttr(loginDTO.email);
      if (!user) {
        throw new UserNotFoundError();
      }
      if (user.verified !== true) {
        throw new Error('Kindly verify this user');
      }
      if (!user || !user == (await compare(loginDTO.password, user.password))) {
        throw new Error('Password not matched');
      } else {
        signature = await Generatesignature({
          id: user.id,
          email: user.email,
          verified: user.verified,
        });
      }
      return {
        message: 'You have successfully logged in',
        verified: user.verified,
        email: user.email,
        signature,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async createForgottenPasswordToken(email: string) {
    const uuid = uuidv4();

    const validEmail = await this._findByAttr(email);
    if (
      validEmail &&
      (new Date().getTime() - validEmail.timestamp.getTime()) / 60000 < 15
    ) {
      throw new HttpException(
        'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const updateToken = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({
        resetToken: uuid,
        timestamp: new Date(),
      })
      .where({
        email: email,
      })
      .execute();

    if (updateToken) {
      return updateToken;
    } else {
      throw new HttpException(
        'LOGIN.ERROR.GENERIC_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async requestPasswordReset(email: string) {
    const user = await this._findByAttr(email);
    if (!user) {
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const token = await this.createForgottenPasswordToken(email);
    if (token) {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER, // generated ethereal user
          pass: process.env.GMAIL_PASSWORD, // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      let mailOptions = {
        from: '"Company" <' + process.env.USER_NAME + '>',
        to: email, // list of receivers (separated by ,)
        subject: 'Frogotten Password',
        text: 'Forgot Password',
        html:
          'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href=' +
          process.env.URL +
          ':' +
          process.env.PORT +
          '/auth/email/reset-password/' +
          token +
          '>Click here</a>', // html body
      };

      const sent = await new Promise<boolean>(async function (resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });
      return sent;
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGISTERED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const user = await this._findByAttr(resetToken);

    if (!user) {
      throw new HttpException(
        'Invalid or expired reset token',
        HttpStatus.FORBIDDEN,
      );
    }

    user.password = newPassword;
    user.resetToken = null;
    await this.userRepository.save(user);
  }

  public async changeStatusAccount(
    changeStatusRequest: ChangeStatusRequest,
  ): Promise<User> {
    const user = await this._findByAttr(changeStatusRequest.id);

    if (!user) {
      throw new UserNotFoundError();
    } else {
      await this._verifyUserPassword(
        user.password,
        changeStatusRequest.password,
      );
      if (user.accountState === changeStatusRequest.state) {
        throw new CannotChangeToSameStateError();
      } else {
        user.accountState = changeStatusRequest.state;
        this.userRepository.save(user);
      }
    }
    return;
  }
}
