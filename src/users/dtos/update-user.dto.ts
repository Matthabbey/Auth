import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty()
  @IsString()
  readonly dateOfBirth: string;
  @ApiProperty()
  @IsString()
  readonly firstName: string;
  @ApiProperty()
  @IsString()
  readonly lastName: string;
  @ApiProperty()
  @IsString()
  readonly phoneNumber: string;
}
