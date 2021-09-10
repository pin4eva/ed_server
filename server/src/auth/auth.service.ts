import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';
import { Model } from 'mongoose';
import {
  AccountTypeEnum,
  ChangePasswordDTO,
  RegisterWithEmailDTO,
} from 'src/user/dto/user.dto';
import { User, UserDocument } from 'src/user/entity/user.schema';
import config from 'src/utils/config';
import { sendMail } from 'src/utils/sendMail';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  async registerWithEmail(
    data: Partial<RegisterWithEmailDTO>,
  ): Promise<Partial<UserDocument>> {
    const { password, email } = data;
    let user = await this.userModel.findOne({ email });
    if (user)
      throw new BadRequestException('Email already exist, signin instead');
    const payload: Partial<User> = {
      ...data,
      password: bcrypt.hashSync(password, 10),
      emailToken: (Math.floor(Math.random() * 90000) + 10000).toString(),
      name: `${data.firstName} ${data.lastName}`,
    };
    try {
      user = new this.userModel(payload);
      user.save();
      delete user.password;
      return user;
    } catch (error) {
      throw error;
    }
  }
  async registerWithGoogle(data: UserDocument): Promise<UserDocument> {
    let user = await this.userModel
      .findOne({ email: data.email })
      .select('-password');
    if (user) {
      try {
        await this.userModel.findByIdAndUpdate(
          user.id,
          { ...data, image: user.image ? user.image : data.image },
          { new: true },
        );
        return user;
      } catch (error) {
        throw error;
      }
    }
    try {
      user = await this.userModel.create(data);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginWithEmail(
    email: string,
    password: string,
  ): Promise<Partial<UserDocument>> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException('You are not registered here');

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch)
        throw new UnauthorizedException('Email or password not correct');

      if (user.accountType === AccountTypeEnum.Staff) {
        if (!user?.isActive)
          throw new BadRequestException(
            'Please contact support@edfhr.org to activate your account',
          );
      }

      const { firstName, lastName, image, id, role, accountType, reps } = user;
      return {
        firstName,
        lastName,
        image,
        role,
        email,
        id,
        accountType,
        reps,
      };
    } catch (error) {
      throw error;
    }
  }
  async loginWithGmail(data: UserDocument): Promise<UserDocument> {
    try {
      const user = await this.userModel
        .findOne({
          googleId: data.googleId,
          email: data.email,
        })
        .select('-password');
      if (!user) throw new NotFoundException('No Record found');

      return user;
    } catch (error) {
      throw error;
    }
  }
  async getMe(data: UserDocument): Promise<UserDocument> {
    try {
      await this.userModel.updateOne(
        { _id: data?.id },
        {
          $set: { lastSeen: new Date() },
        },
      );
      return await this.userModel.findById(data?.id).select('-password');
    } catch (error) {
      throw error;
    }
  }
  // Forgot Password
  async forgotPassword(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).select('-password');
    if (!user) throw new NotFoundException('No record found');
    const token = Math.floor(Math.random() * 90000) + 10000;
    try {
      await user.update({ $set: { emailToken: token?.toString() } });

      await sendMail(
        user?.email,
        'Change Password',
        `Here is your verification code ${token}`,
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ emailToken: token })
      .select('-password');
    if (!user) throw new NotFoundException('Invalid token');
    try {
      await user.update({ $set: { emailToken: '' } });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data: ChangePasswordDTO): Promise<UserDocument> {
    let user = await this.userModel.findById(data.id).select('-password');
    if (!user) throw new NotFoundException('No record found');
    try {
      user = await this.userModel.findByIdAndUpdate(data.id, {
        $set: { password: bcrypt.hashSync(data.password, 10) },
      });
      await sendMail(
        user?.email,
        'Change Password',
        `Your password was changed successfully. If you did not change it, click <a href="https://edfhr.org/auth?mode=change password&&id=${user?.id}">here</a> to reset your password again`,
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
  async verifyUser(token: string): Promise<Partial<UserDocument>> {
    const validToken = verify(token, config.SECRET, (err) => {
      if (err) throw new BadRequestException(err);
    });

    try {
      const user = await this.userModel
        .findById(validToken)
        .select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  }
}
