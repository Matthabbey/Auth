import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsString } from "class-validator";

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

}