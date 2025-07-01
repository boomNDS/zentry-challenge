import { Test, TestingModule } from '@nestjs/testing';
import { ReferralPointService } from './referral-point.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReferralPointService', () => {
  let service: ReferralPointService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralPointService,
        {
          provide: PrismaService,
          useValue: {
            referralPoint: {
              create: jest.fn(),
              upsert: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReferralPointService>(ReferralPointService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should give 1 point to new user only if no referrer', async () => {
    await service.awardReferralPoints('user1');
    expect(prisma.referralPoint.create).toHaveBeenCalledWith({
      data: { userId: 'user1', points: 1 },
    });
    expect(prisma.referralPoint.upsert).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should give points to new user and direct referrer', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      referredById: null,
    });

    await service.awardReferralPoints('user2', 'referrer1');

    expect(prisma.referralPoint.create).toHaveBeenCalledWith({
      data: { userId: 'user2', points: 1 },
    });
    expect(prisma.referralPoint.upsert).toHaveBeenCalledWith({
      where: { userId: 'referrer1' },
      update: { points: { increment: 1 } },
      create: { userId: 'referrer1', points: 1 },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'referrer1' },
      select: { referredById: true },
    });
  });

  it('should give points to new user, direct referrer, and depth-2 referrer', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      referredById: 'referrer2',
    });

    await service.awardReferralPoints('user3', 'referrer1');

    expect(prisma.referralPoint.create).toHaveBeenCalledWith({
      data: { userId: 'user3', points: 1 },
    });
    expect(prisma.referralPoint.upsert).toHaveBeenCalledWith({
      where: { userId: 'referrer1' },
      update: { points: { increment: 1 } },
      create: { userId: 'referrer1', points: 1 },
    });
    expect(prisma.referralPoint.upsert).toHaveBeenCalledWith({
      where: { userId: 'referrer2' },
      update: { points: { increment: 1 } },
      create: { userId: 'referrer2', points: 1 },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'referrer1' },
      select: { referredById: true },
    });
  });
});
