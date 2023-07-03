import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";

export class SignupDTO {
    @ApiProperty()
    @IsString()
    readonly email: string

    @ApiProperty()
    @IsString()
    readonly firstName: string

    @ApiProperty()
    @IsString()
    readonly lastName: string
    
    @ApiProperty()
    @IsString()
    readonly password: string

    @ApiProperty()
    @IsString()
    readonly phoneNumber: string

    @ApiProperty()
    @IsString()
    readonly dateOfBirth: string
}