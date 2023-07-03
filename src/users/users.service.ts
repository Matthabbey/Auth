import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities';
import { LoginDTO, SignupDTO } from 'src/auth/dtos';
import {
  CannotChangeToSameStateError,
  CustomFuelStationException,
  EmailAlreadyExistsException,
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
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDTO } from './dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
  private async _findByAttr(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  public async findUserByEmail(req: any) {
    try {
      const data = req.user;

      if (!data) {
        throw new NotFoundException();
      }

      const user = await this._findByAttr(data.email);
      if (!user) {
       throw new NotFoundException()
      }

      const { password, resetToken, salt, ...result } = user;

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  private async _verifyUserPassword(password: string, inputPassword: string) {
    const passwordMatch = await matchPassword(password, inputPassword);

    if (!passwordMatch) {
      throw new PasswordNotMatchError();
    }
  }

  public async createUser(signupDTO: SignupDTO) {
    try {
      let user: any;
      const salt = await GenerateSalt();
      const otp = generateOTP();
      const userPassword = await GeneratePassword(signupDTO.password, salt);
      const existingUser = await this.userRepository.findOne({where: {email: signupDTO.email}});
      if (existingUser.email === signupDTO.email) {
        return {message: "Email already exist"}
      }
      if (!existingUser) {
        user = this.userRepository.create();
        user.email = signupDTO.email;
        user.firstName = signupDTO.firstName;
        user.lastName = signupDTO.lastName;
        user.password = userPassword;
        user.verified = false;
        user.phoneNumber = signupDTO.phoneNumber,
        user.dateOfBirth = signupDTO.dateOfBirth,
        user.salt = salt;
        user.otp = otp;

        if (user) {
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
            to: user.email, // list of receivers (separated by ,)
            subject: 'OTP',
            text: 'OtP',
            html: `Here is your  OTP ${otp} to verify your account`, // html body
          };

          const sent = await new Promise<boolean>(async function (
            resolve,
            reject,
          ) {
            return await transporter.sendMail(
              mailOptions,
              async (error, info) => {
                if (error) {
                  console.log('Message sent: %s', error);
                  return reject(false);
                }
                console.log('Message sent: %s', info.messageId);
                resolve(true);
              },
            );
          });
        } else {
          throw new HttpException(
            'REGISTER.USER_NOT_REGISTERED',
            HttpStatus.FORBIDDEN,
          );
        }
        return this.userRepository.save(user);
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }

  public async emailVerification(token: number) {
    const verify = await this.userRepository.findOne({ where: { otp: token } });

    if (!token) {
      return { message: 'Wrong Token For verification' };
    }

    if (verify && verify.email && verify.id) {
      const user = await this.userRepository.findOne({
        where: { email: verify.email },
      });
      if(user.verified == true){
        return { message: "User has been verified"}
      }
      if (!user.verified === true) {
        user.verified = true;
        const userVerified = await this.userRepository.save(user);
      }
      return { message: "User verification successful" };
    } else {
      throw new HttpException(
        'LOGIN_EMAIL_CODE_NOT_VERIFIED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async loginUser(loginDTO: LoginDTO) {
    try {
      let access_token: any;
      const user = await this._findByAttr(loginDTO.email);
      if (!user) {
        throw new UserNotFoundError();
      }
      if (user.verified !== true) {
        return { message: 'Kindly verify this user' };
      }
      if (!user || !user == (await compare(loginDTO.password, user.password))) {
        return { message: 'Password not matched' };
      } else {
        access_token = await Generatesignature({
          id: user.id,
          email: user.email,
          verified: user.verified,
        });
      }
      return {
        message: 'You have successfully logged in',
        access_token,
      };
    } catch (error) {
      return {
        message: 'Invalid Credentials'
      };
  }
}

  public async updateUserProfile(find: any, update: UpdateUserDTO): Promise<any> {
    try {
      console.log(find.user.userId);
      const id = find.user.userId;
      const user = await this.userRepository.findOne({ where: { id: id } });

      if (!user) {
        return {
          Error: 'You are not authorized to update your profile',
        };
      }
      const { firstName, lastName, phoneNumber, dateOfBirth } = update;

      const updatedUser = await this.userRepository
        .createQueryBuilder()
        .update(user)
        .set({ firstName, lastName, phoneNumber, dateOfBirth }) // Specify the updated values using the set method
        .where({ id })
        .execute();

      if (updatedUser.affected === 0) {
        throw new NotFoundException('User not found');
      }

      const updated = await this.userRepository.findOne({ where: { id } });

      return { message: 'Successfully updated', succ: updated };
    } catch (error) {
      // throw new Error(error);
      return {
        Error: `Internal server ${error}`,
        throw: new Error(error),
        route: 'users/update-user-profile',
      };
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

  public async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
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
