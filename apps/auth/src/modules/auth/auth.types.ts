export type LoginUser = {
  email: String;
  password: String;
}
export type RegisterUser = {
  name: String;
  email: String;
  password: String;
}
export interface ReqAuthenticateUser extends Request {
  id : String,
}



