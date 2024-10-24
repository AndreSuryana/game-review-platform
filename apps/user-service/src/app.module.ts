import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import configuration from 'src/config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from 'src/config/database.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { host, port, name, user, password } =
          configService.get<DatabaseConfig>('database');

        let uri = `mongodb://${host}:${port}/${name}`;
        if (user && password) {
          uri = `mongodb://${user}:${password}@${host}:${port}/${name}`;
        }

        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
