import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { BadJWTError } from './bad-jwt.error';
import { NoJWTError } from './no-jwt.error';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use (req: Request, res: Response, next: NextFunction): void {
      const authHeader = req.headers["authorization"];

      if (authHeader) {
        const bearerIndex = authHeader.indexOf('Bearer');
        const token = authHeader.substring(bearerIndex + 7);

        try {
            verify(token, process.env.JWT_SECRET)
        } catch (error) {
            throw new BadJWTError()
        }

        next()

      }else {
        throw new NoJWTError()
      }
    };
  }

