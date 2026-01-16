import jwt from "jsonwebtoken";
import {env} from "@/config/env";

export class JwtService {
  sign(payload: object) {
    return jwt.sign(payload, env.JWT_SECRET!, {
      expiresIn: "7d"
    });
  }

  verify(token: string) {
    return jwt.verify(token, env.JWT_SECRET!);
  }
}
