import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDTO, OtpDTO, SignupDTO } from './dtos';
import * as owasp from 'owasp-password-strength-test';
import { PasswordIsWeak } from './errors';
import { User } from '../users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailAlreadyExistsException,
  UserNotFoundError,
} from '../users/errors';
import { compare } from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users';
import {
  GeneratePassword,
  GenerateSalt,
  Generatesignature,
  generateOTP,
} from '../utilities';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private verifyPasswordStrength(password: string) {
    const testResult = owasp.test(password);

    if (testResult.errors.length) {
      throw new PasswordIsWeak(testResult.errors);
    }
  }

  async _findByAttr(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async signUp(signupDTO: SignupDTO, res: Response) {
    this.verifyPasswordStrength(signupDTO.password);
    try {
      let user: any;
      const salt = await GenerateSalt();
      const otp = generateOTP();
      const userPassword = await GeneratePassword(signupDTO.password, salt);
      const existingUser = await this.userRepository.findOne({
        where: { email: signupDTO.email },
      });
      if (existingUser) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Email Already Exist' });
      }

      if (!existingUser) {
        user = this.userRepository.create();
        user.email = signupDTO.email;
        user.firstName = signupDTO.firstName;
        user.lastName = signupDTO.lastName;
        user.password = userPassword;
        user.verified = false;
        (user.phoneNumber = signupDTO.phoneNumber), (user.salt = salt);
        user.otp = otp;

        // if (user) {
        //   let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //       user: process.env.GMAIL_USER, // generated ethereal user
        //       pass: process.env.GMAIL_PASSWORD, // generated ethereal password
        //     },
        //     tls: {
        //       rejectUnauthorized: false,
        //     },
        //   });

        //   let mailOptions = {
        //     from: '"Company" <' + process.env.USER_NAME + '>',
        //     to: user.email, // list of receivers (separated by ,)
        //     subject: 'OTP',
        //     text: 'OtP',
        //     html: `Here is your  OTP ${otp} to verify your account`, // html body
        //   };

        //   const sent = await new Promise<boolean>(async function (
        //     resolve,
        //     reject,
        //   ) {
        //     return await transporter.sendMail(
        //       mailOptions,
        //       async (error, info) => {
        //         if (error) {
        //           console.log('Message sent: %s', error);
        //           return reject(false);
        //         }
        //         console.log('Message sent: %s', info.messageId);
        //         resolve(true);
        //       },
        //     );
        //   });
        // } else {
        //   throw new HttpException(
        //     'REGISTER.USER_NOT_REGISTERED',
        //     HttpStatus.FORBIDDEN,
        //     );
        //   }
        const success = await this.userRepository.save(user);

        return res
          .status(HttpStatus.CREATED)
          .json({ message: 'Check your mail verification code', success });
      }
    } catch (error) {
      console.log(error.message);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }

  public async emailVerify(token: any) {
    const otp = token.otp;
    const verify = await this.userRepository.findOneBy({ otp: otp });

    console.log(otp);
    console.log(verify);

    if (!token) {
      return { message: 'Wrong Token For verification' };
    }

    if (verify && verify.email && verify.id) {
      const user = await this.userRepository.findOne({
        where: { email: verify.email },
      });
      if (user.verified == true) {
        return { message: 'Email has been verified' };
      }
      if (!user.verified === true) {
        user.verified = true;
        const userVerified = await this.userRepository.save(user);
      }
      return { message: 'Email verification successful' };
    } else {
      throw new HttpException(
        'WRONG_TOKEN_FOR_VERIFICATION',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  public async login(loginDTO: LoginDTO, res: Response) {
    try {
      let access_token: any;
      const user = await this.userRepository.findOne({
        where: { email: loginDTO.email },
      });
      if (!user) {
        throw new UserNotFoundError();
      }
      console.log(loginDTO.email, '1');
      if (user.verified !== true) {
        return { message: 'Kindly verify this user' };
      }
      console.log(loginDTO.email, '2');

      if (!user || !user == (await compare(loginDTO.password, user.password))) {
        return { message: 'Password not matched' };
      } else {
        access_token = await Generatesignature({
          id: user.id,
          email: user.email,
          verified: user.verified,
        });
      }
      console.log(loginDTO.email, '3');
      return res
        .status(HttpStatus.OK)
        .json({ message: 'You have successfully logged in', access_token });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Invalid Credentials' });
    }
  }
}
