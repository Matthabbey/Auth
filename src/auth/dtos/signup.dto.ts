import { IsNumber, IsString } from "class-validator";

export class SignupDTO {

    @IsString()
    readonly email: string

    @IsString()
    readonly firstName: string

    @IsString()
    readonly lastName: string

    @IsString()
    readonly password: string

    // @IsNumber()
    // readonly otp: number
}