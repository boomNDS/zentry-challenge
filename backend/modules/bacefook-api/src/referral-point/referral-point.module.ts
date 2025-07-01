import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReferralPointService } from './referral-point.service';

@Module({
  imports: [PrismaModule],
  providers: [ReferralPointService],
  exports: [ReferralPointService],
})
export class ReferralPointModule {}
