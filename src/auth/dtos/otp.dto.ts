import { ApiProperty } from '@nestjs/swagger';
import { IsNumber,  } from 'class-validator';

export class OtpDTO {

    @ApiProperty()
    @IsNumber()
    readonly otp: Number
}