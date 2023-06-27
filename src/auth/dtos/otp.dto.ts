import { IsNumber, IsString } from 'class-validator';

export class OtpDTO {
    @IsNumber()
    readonly otp: number
}