import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtStrategy } from '../auth/jwt.strategy';
import { LoyaltyService } from './loyalty.service';
import { EarnDto } from './dto/earn.dt';
import { ClaimDto } from './dto/claim.dto';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @UseGuards(JwtStrategy)
  @Get('/:customerId')
  // @CacheKey('pointsHistory')
  // @CacheTTL(60)
  async getAllPoints(@Param('customerId') customerId: number) {
    return this.loyaltyService.getTotalPoints(customerId);
  }

  @UseGuards(JwtStrategy)
  @Post('earn')
  async earnPoints(@Body() earnDto: EarnDto) {
    return this.loyaltyService.earnPoints(earnDto);
  }

  @UseGuards(JwtStrategy)
  @Post('claim')
  async claimPoints(@Body() claimDto: ClaimDto) {
    return this.loyaltyService.claimPoints(claimDto);
  }

  @UseGuards(JwtStrategy)
  @Get('/:customerId/history')
  @CacheKey('pointsHistory')
  @CacheTTL(60)
  async getPointsHistory(@Param('customerId') customerId: number) {
    return this.loyaltyService.getPointsHistory(customerId);
  }
}
