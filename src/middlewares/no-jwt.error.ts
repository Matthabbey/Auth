import { HttpException, HttpStatus } from "@nestjs/common";

export class NoJWTError extends HttpException{
    constructor(){
        super(
            'Could not completed the operation, Access token not found',
            HttpStatus.NOT_FOUND
        )
    }
}