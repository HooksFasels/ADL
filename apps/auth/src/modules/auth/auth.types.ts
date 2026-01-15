import { UserRole } from 'db/client';

export type LoginUser = {
  email: string;
  password: string;
};
export type RegisterUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};
export interface ReqAuthenticateUser extends Request {
  id: string;
}
export { UserRole };
