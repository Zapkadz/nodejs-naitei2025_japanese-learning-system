import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestModule } from './modules/test/test.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeedService } from './config/seed.service';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    TestModule,
    ProgressModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
