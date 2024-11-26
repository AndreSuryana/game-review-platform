import {
  GetUserProfileRequest,
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
  UpdateUserPreferencesRequest,
  UpdateUserPreferencesResponse,
} from '@grp/proto/user/user-service';
import {
  Controller,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { handleError } from 'src/common/handlers/exception.handler';
import { validateConvertDto } from 'src/common/helpers/validation-pipe.helper';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetProfileDto } from './dto/get-profile.dto';
import { UserService } from 'src/user/user.service';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  private readonly logger: Logger = new Logger(ProfileController.name, {
    timestamp: true,
  });

  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @GrpcMethod('UserService', 'GetUserProfile')
  async getUserProfile(
    request: GetUserProfileRequest,
  ): Promise<GetUserProfileResponse> {
    try {
      const { userId } = await validateConvertDto(GetProfileDto, request);
      this.logger.log(`Fetching profile for user ${userId}`);

      // Validate user existence
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('Could not find the user');
      }

      // Retrieve or create profile
      let profile = await this.profileService.findProfileByUserId(userId);
      if (!profile) {
        this.logger.warn(
          `Profile not found for user ${userId}, creating default profile.`,
        );
        profile = await this.profileService.createProfile(userId, {
          preferences: {
            language: 'en',
            notifications: [
              { channel: 'email', enabled: true }, // Enable email notification by default
            ],
          },
        });
      }

      return {
        userId: profile.user.toString(),
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        avatarUrl: profile.avatarUrl || '',
        bio: profile.bio || '',
        address: profile.address || null,
        preferences: profile.preferences || null,
      };
    } catch (e) {
      this.logger.error(
        `Failed to retrieve profile for user ${request.userId}: ${e.message}`,
        e.stack,
      );
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'UpdateUserProfile')
  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    try {
      const updateProfileDto = await validateConvertDto(
        UpdateProfileDto,
        request,
      );

      // Validate user existence
      const user = await this.userService.findUserById(updateProfileDto.userId);
      if (!user) {
        throw new NotFoundException('Could not find the user');
      }

      await this.profileService.updateProfile(updateProfileDto);
      return { message: 'Profile updated successfully' };
    } catch (e) {
      this.logger.error(`Error update user profile: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }

  @GrpcMethod('UserService', 'UploadProfilePicture')
  async uploadProfilePicture(
    request: UploadProfilePictureRequest,
  ): Promise<UploadProfilePictureResponse> {
    throw new NotImplementedException();
  }

  @GrpcMethod('UserService', 'UpdateUserPreferences')
  async updateUserPreferences(
    request: UpdateUserPreferencesRequest,
  ): Promise<UpdateUserPreferencesResponse> {
    try {
      const { userId, preferences } = await validateConvertDto(
        UpdateProfileDto,
        request,
      );

      // Validate user existence
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('Could not find the user');
      }

      await this.profileService.updateProfile({
        userId,
        preferences,
      });

      return { message: 'User preferences updated successfully' };
    } catch (e) {
      this.logger.error(`Error update user profile: ${e.message}`, e.stack);
      throw handleError(e);
    }
  }
}
