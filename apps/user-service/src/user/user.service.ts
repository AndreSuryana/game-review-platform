import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // Check if email or username already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email is already taken');
    }

    // Generate password salt and hash
    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    // Create new user
    const newUser = new this.userModel({
      username,
      email,
      passwordHash,
      passwordSalt,
      role: 'user', // TODO: Don't hardcode this role value!
    });

    return newUser.save();
  }
}
