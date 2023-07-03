import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordIsWeak extends HttpException {
  constructor(reason: string[]) {
    super(
      {
        error: 'Password is weak',
        reason,
      },
      HttpStatus.CONFLICT,
    );
  }
}
