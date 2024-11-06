import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private readonly logger: Logger = new Logger(UserService.name, {
    timestamp: true,
  });

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
    try {
      const user = await this.userModel.findOne({
        $or: [{ email }, { username }],
      });
      return user || null;
    } catch (e) {
      this.logger.error(`Error finding user: ${e.message}`, e.stack);
      return null;
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ _id: userId });
      return user || null;
    } catch (e) {
      this.logger.error(`Error finding user by id: ${e.message}`, e.stack);
      return null;
    }
  }

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ username });
      return user || null;
    } catch (e) {
      this.logger.error(
        `Error finding user by username: ${e.message}`,
        e.stack,
      );
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email });
      return user || null;
    } catch (e) {
      this.logger.error(`Error finding user by email: ${e.message}`, e.stack);
      return null;
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { username, email, password, ...otherUpdates } = updateUserDto;

    // Check if the new username or email are already taken by other users
    if (username && username !== user.username) {
      const existingUserWithUsername = await this.findUserByUsername(username);
      if (existingUserWithUsername && existingUserWithUsername.id !== userId) {
        throw new ConflictException('Username is already taken');
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUserWithEmail = await this.findUserByEmail(email);
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new ConflictException('Email is already taken');
      }
      user.email = email;
      user.emailVerified = false; // Since user updated to new email, users must verified the new email
    }

    // Handle password update
    if (password) {
      const passwordSalt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, passwordSalt);
      user.passwordHash = passwordHash;
      user.passwordSalt = passwordSalt;
    }


    // Update the user data
    for (const [key, value] of Object.entries(otherUpdates)) {
      if (value !== undefined && value !== null) {
        (user as User)[key] = value;
      }
    }
    return await user.save();
  }

  async deleteUser(userId: string): Promise<void> {
    this.userModel.deleteOne({ _id: userId });
  }
}
