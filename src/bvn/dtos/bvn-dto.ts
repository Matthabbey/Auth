import { ApiProperty } from '@nestjs/swagger';
import { IsString, maxLength } from 'class-validator';

export class BvnDTO {
    @ApiProperty()
    @IsString()
    readonly bvn: string
}