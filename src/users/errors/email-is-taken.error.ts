import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interface';

// export class EmailIsTakenError extends HttpException {
//   constructor() {
//     super(
//       'The email provided is already associated with an existing user.',
//       HttpStatus.CONFLICT,
//     );
//   }
// }

export class EmailIsTakenError extends Error implements AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  constructor() {
    super('Email is already taken');
  }
  salt: string;
  EmailIsTakenError: string;
}
