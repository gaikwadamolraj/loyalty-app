import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    // CacheModule.registerAsync({
    //   useFactory: async () => {
    //     const store = await redisStore({
    //       socket: {
    //         host: 'localhost',
    //         port: 6380,
    //       },
    //     });

    //     return {
    //       store: store as unknown as CacheStore,
    //       ttl: 3 * 60000, // 3 minutes (milliseconds)
    //     };
    //   },
    // }),
    LoyaltyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
