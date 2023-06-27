import { HttpException, HttpStatus } from '@nestjs/common';

export class BadJWTError extends HttpException {
  constructor() {
    super(
      'Access Token is malformed, therefore not valid',
      HttpStatus.FORBIDDEN,
    );
  }
}
