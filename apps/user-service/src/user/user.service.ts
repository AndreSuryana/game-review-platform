import {
  ConflictException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async insertUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, passwordHash, passwordSalt, role } = createUserDto;

    // Check if email or username already exists
    const existingUser = await this.findUser(username, email);
    if (existingUser) {
      throw new ConflictException('Username or email is already taken');
    }

    // Create new user
    const newUser = new this.userModel({
      username,
      email,
      passwordHash,
      passwordSalt,
      role,
    });

    return newUser.save();
  }

  async findUser(username: string, email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });
    return user || null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ _id: userId });
    return user || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username });
    return user || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    return user || null;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // TODO: Not yet implemented!
    throw new NotImplementedException();
  }

  async deleteUser(userId: string): Promise<void> {
    this.userModel.deleteOne({ _id: userId });
  }
}
