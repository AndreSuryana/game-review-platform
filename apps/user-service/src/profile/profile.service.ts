import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Profile } from './schemas/profile.schema';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name, {
    timestamp: true,
  });

  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const profile = new this.profileModel({
      user: userId,
      ...createProfileDto,
    });
    return profile.save();
  }

  async findProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const profile = await this.profileModel.findOne({ user: userId });
      return profile;
    } catch (e) {
      this.logger.error(
        `Error finding profile for user ${userId}: ${e.message}`,
        e.stack,
      );
      throw new NotFoundException('Failed to retrieve profile');
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const { userId, ...updateFields } = updateProfileDto;

    const profile = await this.profileModel
      .findOneAndUpdate(
        { user: userId },
        { $set: updateFields },
        { new: true, upsert: true }, // `new` returns the updated document; `upsert` creates if not found
      )
      .lean();

    return profile;
  }
}
