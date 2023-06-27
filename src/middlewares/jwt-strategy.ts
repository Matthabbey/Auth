import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Generatesignature } from "src/users";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.JWT_SECRET
            }
        )
    }
    async validate(payload: any) {
        return { userId: payload.id, email: payload.email, verified: payload.verified};
}
}