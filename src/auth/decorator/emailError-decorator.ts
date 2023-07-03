// import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
// import { Response } from 'express';
// import { EmailAlreadyExistsException } from 'src/users/errors';

// @Catch(EmailAlreadyExistsException)
// export class EmailAlreadyExistsFilter implements ExceptionFilter {
//   catch(exception: EmailAlreadyExistsException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     response.status(HttpStatus.CONFLICT).json({
//       statusCode: HttpStatus.CONFLICT,
//       message: exception.message,
//     });
//   }
// }


import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'; 
import { Request, Response } from 'express'; 
 
@Catch(HttpException) 
export class HttpExceptionFilter implements ExceptionFilter { 
  catch(exception: HttpException, host: ArgumentsHost) { 
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>(); 
    const request = ctx.getRequest<Request>(); 
    const status = exception.getStatus(); 
 
    response 
      .status(status) 
      .json({ 
        statusCode: status, 
        timestamp: new Date().toISOString(), 
        path: request.url, 
      }); 
  } 
} 