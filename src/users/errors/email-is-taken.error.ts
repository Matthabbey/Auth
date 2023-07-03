// import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpException, HttpStatus } from "@nestjs/common";

export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super('Email already exists', HttpStatus.CONFLICT);
  }
}

export class CustomFuelStationException extends HttpException{ 
  constructor(message: string, statusCode: number) { 
      super(message, statusCode); 
  } 
} 