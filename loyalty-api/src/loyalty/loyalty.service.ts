import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EarnDto } from './dto/earn.dt';
import { ClaimDto } from './dto/claim.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async earnPoints(earnDto: EarnDto) {
    const { customerId, points } = earnDto;

    // Check if the customer exists
    const customer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Find the loyalty record for the customer
    const loyaltyRecord = await this.prisma.loyaltyPoints.findFirst({
      where: { customer_id: customerId },
    });

    if (loyaltyRecord) {
      // Update existing loyalty points
      await this.prisma.loyaltyPoints.update({
        where: { loyalty_id: loyaltyRecord.loyalty_id },
        data: { total_points: { increment: points } },
      });
    } else {
      // Create a new loyalty points record
      await this.prisma.loyaltyPoints.create({
        data: { customer_id: customerId, total_points: points },
      });
    }

    // Log the transaction
    await this.prisma.pointTransactions.create({
      data: {
        customer_id: customerId,
        points_earned: points,
        description: 'Points earned',
      },
    });

    // Invalidate cache for points history
    // await this.cacheManager.del(`pointsHistory-${customerId}`);

    return { message: 'Points earned successfully' };
  }

  async getTotalPoints(customerId: number) {
    const customerIdInt =
      typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;

    const customer = await this.prisma.customers.findUnique({
      where: { customer_id: customerIdInt },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Find the loyalty record for the customer
    const loyaltyRecord = await this.prisma.loyaltyPoints.findFirst({
      where: { customer_id: customer.customer_id },
    });

    return loyaltyRecord;
  }

  async getPointsHistory(customerId: number) {
    const customerIdInt =
      typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;

    const transactions = await this.prisma.pointTransactions.findMany({
      where: { customer_id: customerIdInt },
    });

    if (!transactions.length) {
      throw new NotFoundException('No transactions found');
    }

    return transactions;
  }

  async claimPoints(claimDto: ClaimDto) {
    const { customerId, points, description } = claimDto;

    const customerIdInt =
      typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;

    const loyaltyPoints = await this.prisma.loyaltyPoints.findFirst({
      where: { customer_id: customerIdInt },
    });

    if (!loyaltyPoints || loyaltyPoints.total_points < points) {
      throw new BadRequestException('Insufficient points');
    }

    await this.prisma.loyaltyPoints.update({
      where: { loyalty_id: loyaltyPoints.loyalty_id },
      data: { total_points: { decrement: points } },
    });

    await this.prisma.claims.create({
      data: {
        customer_id: customerId,
        points_used: points,
        description,
      },
    });

    await this.prisma.pointTransactions.create({
      data: {
        customer_id: customerId,
        points_redeemed: points,
        description: 'Points claimed',
      },
    });

    // Invalidate cache for points history
    // await this.cacheManager.del(`pointsHistory-${customerId}`);

    return { message: 'Points claimed successfully' };
  }
}
