import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralPointService {
  constructor(private prisma: PrismaService) {}

  async awardReferralPoints(userId: string, referredById?: string) {
    //  Give new user 1 point for joining
    await this.prisma.referralPoint.create({
      data: {
        userId,
        points: 1,
      },
    });

    if (referredById) {
      // Give 1 point to direct referrer
      await this.prisma.referralPoint.upsert({
        where: { userId: referredById },
        update: { points: { increment: 1 } },
        create: { userId: referredById, points: 1 },
      });

      // Find referrer's referrer (depth 2)
      const referrer = await this.prisma.user.findUnique({
        where: { id: referredById },
        select: { referredById: true },
      });
      if (referrer?.referredById) {
        await this.prisma.referralPoint.upsert({
          where: { userId: referrer.referredById },
          update: { points: { increment: 1 } },
          create: { userId: referrer.referredById, points: 1 },
        });
      }
    }
  }
}
