import { IsString } from 'class-validator';

export class CahngeAccountStatusDTO{
    @IsString()
    readonly reason: string

    @IsString()
    readonly password: string
}