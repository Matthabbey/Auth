import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OtpDTO {

    @ApiProperty()
    @IsString()
    readonly otp?: string
}