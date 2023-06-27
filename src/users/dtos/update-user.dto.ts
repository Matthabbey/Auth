import { IsString } from "class-validator"; 


export class UpdateUserDTO {
    @IsString()
    readonly password: string

    @IsString()
    readonly firstName: string

    @IsString()
    readonly lastName: string
}