import { Request } from 'express';
import { UserDocument } from './user/entity/user.schema';

interface ReqWithUser extends Request {
  user: UserDocument;
}

interface ReqWithPassport extends Request {
  passport: {
    user: UserDocument;
  };
}
