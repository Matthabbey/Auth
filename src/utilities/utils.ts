import { compare, genSalt, hash } from 'bcrypt';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { AuthPayload } from '../users/interfaces';

// Generating of salt code
export const GenerateSalt = async () => {
  return await genSalt();
};

export const generateOTP = () => {
  // Generate a random OTP (e.g., 4-digit number)
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const GeneratePassword = async (
  plainTextPassword: string,
  salt: string,
) => {
  return await hash(plainTextPassword, salt);
};

export const matchPassword = async (
  hashedPassword: string,
  plainTextPassword: string,
) => {
  return await compare(plainTextPassword, hashedPassword);
};

export const Generatesignature = async (payload: AuthPayload) => {
  return sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

//Verifying the signature of the user before allowing login
export const verifySignature = async (signature: string) => {
  return verify(signature, process.env.JWT_SECRET) as unknown as JwtPayload;
};

export const validatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string,
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // generated ethereal user
    pass: process.env.GMAIL_PASSWORD, // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const mailSent = async (
  from: string, //'"Fred Foo 👻" <foo@example.com>', // sender address
  to: string, //"bar@example.com, baz@example.com", // list of receivers
  subject: string, //"Hello ✔", // Subject line
  html: string, //"<b>Hello world?</b>", // html body
) => {
  try {
    const response = await transport.sendMail({
      from: process.env.ADMIN,
      to,
      subject: process.env.USER,
      html,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const emailHtml = (otp: number) => {
  let response = `
        <div style='max-width: 700px; margin:auto; border:10px solid #ddd; padding:50px 20px; font-size: 110%;'>

        <h2 style="text-align: center; text-transform: uppercase; color:teal;"> Welcome to Matthabbey Store </h2>
        <p>Hi ${process.env.USER} Welcome to MATTHABBEY-STORE</p>
        <p> , your otp is ${otp}</p>


        </div>
    `;
  return response;
};
