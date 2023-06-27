import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordNotMatchError extends HttpException {
  constructor() {
    super('Invalid Password with this User', HttpStatus.FORBIDDEN);
  }
}
