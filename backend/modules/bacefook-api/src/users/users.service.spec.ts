import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { createMockEvent, createMockUser } from './user.factory';
import { ReferralPointService } from '../referral-point/referral-point.service';
import { FriendResponseDto } from './dto/friend.dto';

type MockUserWithRelations = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  referredBy?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  referrals: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
  friends: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
};

type MockPrismaService = {
  user: {
    create: jest.MockedFunction<PrismaService['user']['create']>;
    findMany: jest.MockedFunction<PrismaService['user']['findMany']>;
    findUnique: jest.MockedFunction<PrismaService['user']['findUnique']>;
    findFirst: jest.MockedFunction<PrismaService['user']['findFirst']>;
    update: jest.MockedFunction<PrismaService['user']['update']>;
    delete: jest.MockedFunction<PrismaService['user']['delete']>;
    count: jest.MockedFunction<PrismaService['user']['count']>;
  };
  event: {
    create: jest.MockedFunction<PrismaService['event']['create']>;
    findMany: jest.MockedFunction<PrismaService['event']['findMany']>;
    count: jest.MockedFunction<PrismaService['event']['count']>;
  };
  networkStrength: {
    upsert: jest.MockedFunction<PrismaService['networkStrength']['upsert']>;
    findMany: jest.MockedFunction<PrismaService['networkStrength']['findMany']>;
  };
  referralPoint: {
    findMany: jest.MockedFunction<PrismaService['referralPoint']['findMany']>;
  };
};

type NetworkStrengthWithUser = {
  user: FriendResponseDto;
  strength: number;
  calculatedAt: Date;
};

type ReferralPointWithUser = {
  user: FriendResponseDto;
  points: number;
  updatedAt: Date;
};

type MockFriendWithNetworkStrength = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  networkStrength?: { strength: number };
  email: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
  referredById: string | null;
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: MockPrismaService;
  let referralPointService: ReferralPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            networkStrength: {
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
            referralPoint: {
              findMany: jest.fn(),
            },
          } as MockPrismaService,
        },
        {
          provide: ReferralPointService,
          useValue: {
            awardReferralPoints: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
    referralPointService =
      module.get<ReferralPointService>(ReferralPointService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'john.doe@example.com',
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Software developer',
    };

    it('should create a user successfully', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      const mockUser = createMockUser();
      prismaService.user.create.mockResolvedValue(mockUser);
      (referralPointService.awardReferralPoints as jest.Mock).mockResolvedValue(
        undefined,
      );
      const result = await service.create(createUserDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { referredById, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username },
          ],
        },
      });
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when user already exists', async () => {
      prismaService.user.findFirst.mockResolvedValue(createMockUser());

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username },
          ],
        },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const userId = 'clx1234567890abcdef';
    const updateUserDto: UpdateUserDto = {
      firstName: 'Jane',
      bio: 'Updated bio',
    };

    it('should update user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(createMockUser());
      const updatedUser = {
        ...createMockUser(),
        ...updateUserDto,
      };
      prismaService.user.update.mockResolvedValue(updatedUser);
      prismaService.user.findUnique.mockResolvedValue(updatedUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { referredById, ...expectedUser } = updatedUser;
      const result = await service.update(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const userId = 'clx1234567890abcdef';

    it('should delete user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(createMockUser());

      prismaService.user.delete.mockResolvedValue(createMockUser());

      const result = await service.remove(userId);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users with counts and call database', async () => {
      const mockUsersList = [createMockUser()];
      prismaService.user.findMany.mockResolvedValue(mockUsersList);
      prismaService.user.count.mockResolvedValue(1);
      const result = await service.findAll({ search: '', page: 1, limit: 10 });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { referredById, ...expectedUser } = mockUsersList[0];
      expect(result).toEqual({
        data: [expectedUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);
      const result = await service.findAll({ search: '', page: 1, limit: 10 });
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should call database findMany method', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);
      await service.findAll({ search: '', page: 1, limit: 10 });
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const userId = 'clx1234567890abcdef';

    it('should return user with details and call database', async () => {
      const mockUser = createMockUser();
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { referredById, ...expectedUser } = mockUser;
      const result = await service.findOne(userId);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          friends: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          referrals: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          referralPoints: {
            select: { points: true },
          },
          networkStrength: {
            select: { strength: true },
          },
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('addFriend', () => {
    it('should throw ConflictException if user tries to befriend themselves', async () => {
      await expect(
        service.addFriend({ id: 'user123', friendId: 'user123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      prismaService.user.findUnique.mockResolvedValueOnce(
        createMockUser({ id: 'friend456' }),
      );
      await expect(
        service.addFriend({ id: 'user123', friendId: 'friend456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if friend does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createMockUser({ id: 'user123' }),
      );
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.addFriend({ id: 'user123', friendId: 'friend456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add friends', async () => {
      prismaService.user.findUnique.mockResolvedValue(
        createMockUser({ id: 'user123' }),
      );
      prismaService.user.update.mockResolvedValue(createMockUser());
      const result = await service.addFriend({
        id: 'user123',
        friendId: 'friend456',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { friends: { connect: { id: 'friend456' } } },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'friend456' },
        data: { friends: { connect: { id: 'user123' } } },
      });
      expect(prismaService.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'addfriend' }),
      });
      expect(result).toEqual({ message: 'Friend added successfully' });
    });
  });

  describe('removeFriend', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      prismaService.user.findUnique.mockResolvedValueOnce(
        createMockUser({ id: 'friend456' }),
      );
      await expect(
        service.removeFriend({ id: 'user123', friendId: 'friend456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if friend does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce(
        createMockUser({ id: 'user123' }),
      );
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.removeFriend({ id: 'user123', friendId: 'friend456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove friends', async () => {
      prismaService.user.findUnique.mockResolvedValue(
        createMockUser({ id: 'user123' }),
      );
      prismaService.user.update.mockResolvedValue(createMockUser());
      const result = await service.removeFriend({
        id: 'user123',
        friendId: 'friend456',
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { friends: { disconnect: { id: 'friend456' } } },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'friend456' },
        data: { friends: { disconnect: { id: 'user123' } } },
      });
      expect(prismaService.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'unfriend' }),
      });
      expect(result).toEqual({ message: 'Friend removed successfully' });
    });
  });

  describe('calculateNetworkStrength', () => {
    it('should return 0 if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.calculateNetworkStrength('user123');
      expect(result).toBe(0);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        include: {
          friends: true,
          referrals: true,
          referredBy: true,
        },
      });
    });

    it('should calculate correct network strength', async () => {
      const mockUser = {
        ...createMockUser({ id: 'user123' }),
        friends: [{}, {}, {}] as Array<unknown>,
        referrals: [{}, {}] as Array<unknown>,
        referredBy: { id: 'referrer1' } as object | null,
      };
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.calculateNetworkStrength('user123');
      expect(result).toBe(6);
    });

    it('should calculate correct network strength with no referrer', async () => {
      const mockUser = {
        ...createMockUser({ id: 'user123' }),
        friends: [{}] as Array<unknown>,
        referrals: [] as Array<unknown>,
        referredBy: null as object | null,
      };
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.calculateNetworkStrength('user123');
      expect(result).toBe(1);
    });
  });

  describe('updateNetworkStrength', () => {
    it('should upsert network strength with calculated value', async () => {
      jest.spyOn(service, 'calculateNetworkStrength').mockResolvedValue(7);
      await service.updateNetworkStrength('user123');
      expect(service.calculateNetworkStrength).toHaveBeenCalledWith('user123');
      expect(prismaService.networkStrength.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        update: { strength: 7, calculatedAt: expect.any(Date) },
        create: { userId: 'user123', strength: 7 },
      });
    });
  });

  // ... existing code ...

  describe('getReferralCount', () => {
    it('should return the referral count for a user in a date range', async () => {
      prismaService.user.count.mockResolvedValue(5);
      const result = await service.getReferralCount(
        'user123',
        '2025-07-01',
        '2025-07-10',
      );
      expect(result).toEqual({ count: 5 });
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: {
          referredById: 'user123',
          createdAt: {
            gte: new Date('2025-07-01'),
            lte: new Date('2025-07-10'),
          },
        },
      });
    });
  });

  describe('getReferralTimeseries', () => {
    it('should return timeseries data for referrals', async () => {
      prismaService.user.findMany.mockResolvedValue([
        createMockUser({ createdAt: new Date('2025-07-01T12:00:00Z') }),
        createMockUser({ createdAt: new Date('2025-07-01T15:00:00Z') }),
        createMockUser({ createdAt: new Date('2025-07-02T10:00:00Z') }),
      ]);
      const result = await service.getReferralTimeseries(
        'user123',
        '2025-07-01',
        '2025-07-10',
      );
      expect(result).toEqual({
        series: [
          { date: '2025-07-01', count: 2 },
          { date: '2025-07-02', count: 1 },
        ],
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          referredById: 'user123',
          createdAt: {
            gte: new Date('2025-07-01'),
            lte: new Date('2025-07-10'),
          },
        },
        select: { createdAt: true },
      });
    });
  });

  describe('getFriendsCount', () => {
    it('should return the friends count for a user in a date range', async () => {
      prismaService.event.count.mockResolvedValue(3);
      const result = await service.getFriendsCount(
        'user123',
        '2025-07-01',
        '2025-07-10',
      );
      expect(result).toEqual({ count: 3 });
      expect(prismaService.event.count).toHaveBeenCalledWith({
        where: {
          type: 'addfriend',
          data: {
            path: ['user1Id'],
            equals: 'user123',
          },
          createdAt: {
            gte: new Date('2025-07-01'),
            lte: new Date('2025-07-10'),
          },
        },
      });
    });
  });

  describe('getFriendsTimeseries', () => {
    it('should return timeseries data for friends added', async () => {
      const events = [
        createMockEvent({ createdAt: new Date('2025-07-01T12:00:00Z') }),
        createMockEvent({ createdAt: new Date('2025-07-01T15:00:00Z') }),
        createMockEvent({ createdAt: new Date('2025-07-02T10:00:00Z') }),
      ];
      prismaService.event.findMany.mockResolvedValue(events);
      const result = await service.getFriendsTimeseries(
        'user123',
        '2025-07-01',
        '2025-07-10',
      );
      expect(result).toEqual({
        series: [
          { date: '2025-07-01', count: 2 },
          { date: '2025-07-02', count: 1 },
        ],
      });
      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          type: 'addfriend',
          data: {
            path: ['user1Id'],
            equals: 'user123',
          },
          createdAt: {
            gte: new Date('2025-07-01'),
            lte: new Date('2025-07-10'),
          },
        },
        select: { createdAt: true },
      });
    });
  });

  describe('getTopInfluentialFriends', () => {
    it('should return top 3 influential friends', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user123',
        friends: [{ id: 'friend1' }, { id: 'friend2' }, { id: 'friend3' }],
      } as any);

      const friends: MockFriendWithNetworkStrength[] = [
        {
          id: 'friend1',
          username: 'bob',
          firstName: 'Bob',
          lastName: 'Builder',
          avatar: 'bob.jpg',
          networkStrength: { strength: 10 },
          email: 'bob@example.com',
          bio: 'Bob the builder',
          createdAt: new Date('2025-07-01T00:00:00Z'),
          updatedAt: new Date('2025-07-01T00:00:00Z'),
          referredById: null,
        },
        {
          id: 'friend2',
          username: 'carol',
          firstName: 'Carol',
          lastName: 'Smith',
          avatar: 'carol.jpg',
          networkStrength: { strength: 8 },
          email: 'carol@example.com',
          bio: 'Carol the friend',
          createdAt: new Date('2025-07-01T00:00:00Z'),
          updatedAt: new Date('2025-07-01T00:00:00Z'),
          referredById: null,
        },
        {
          id: 'friend3',
          username: 'dave',
          firstName: 'Dave',
          lastName: 'Jones',
          avatar: 'dave.jpg',
          networkStrength: { strength: 5 },
          email: 'dave@example.com',
          bio: 'Dave the pal',
          createdAt: new Date('2025-07-01T00:00:00Z'),
          updatedAt: new Date('2025-07-01T00:00:00Z'),
          referredById: null,
        },
      ];
      prismaService.user.findMany.mockResolvedValue(friends);

      const result = await service.getTopInfluentialFriends('user123');
      expect(result).toEqual([
        {
          id: 'friend1',
          username: 'bob',
          firstName: 'Bob',
          lastName: 'Builder',
          avatar: 'bob.jpg',
          networkStrength: 10,
        },
        {
          id: 'friend2',
          username: 'carol',
          firstName: 'Carol',
          lastName: 'Smith',
          avatar: 'carol.jpg',
          networkStrength: 8,
        },
        {
          id: 'friend3',
          username: 'dave',
          firstName: 'Dave',
          lastName: 'Jones',
          avatar: 'dave.jpg',
          networkStrength: 5,
        },
      ]);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });

    it('should return empty if user has no friends', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user123',
        friends: [],
      } as any);

      const result = await service.getTopInfluentialFriends('user123');
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getTopInfluentialFriends('user123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getNetworkGraphByName', () => {
    it('should return user network graph by name', async () => {
      const mockUser: MockUserWithRelations & {
        email: string;
        bio: string;
        createdAt: Date;
        updatedAt: Date;
        referredById: string | null;
      } = {
        id: 'user123',
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Wonderland',
        avatar: 'avatar.jpg',
        email: 'alice@example.com',
        bio: 'Just Alice',
        createdAt: new Date('2025-07-01T00:00:00Z'),
        updatedAt: new Date('2025-07-01T00:00:00Z'),
        referredById: null,
        referredBy: {
          id: 'ref1',
          username: 'bob',
          firstName: 'Bob',
          lastName: 'Builder',
          avatar: 'bob.jpg',
        },
        referrals: [
          {
            id: 'ref2',
            username: 'charlie',
            firstName: 'Charlie',
            lastName: 'Day',
            avatar: 'charlie.jpg',
          },
        ],
        friends: [
          {
            id: 'ref3',
            username: 'dave',
            firstName: 'Dave',
            lastName: 'Smith',
            avatar: 'dave.jpg',
          },
        ],
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getNetworkGraphByName('alice');
      expect(result).toEqual({
        user: {
          id: 'user123',
          username: 'alice',
          firstName: 'Alice',
          lastName: 'Wonderland',
          avatar: 'avatar.jpg',
        },
        referredBy: {
          id: 'ref1',
          username: 'bob',
          firstName: 'Bob',
          lastName: 'Builder',
          avatar: 'bob.jpg',
        },
        referrals: [
          {
            id: 'ref2',
            username: 'charlie',
            firstName: 'Charlie',
            lastName: 'Day',
            avatar: 'charlie.jpg',
          },
        ],
        friends: [
          {
            id: 'ref3',
            username: 'dave',
            firstName: 'Dave',
            lastName: 'Smith',
            avatar: 'dave.jpg',
          },
        ],
      });
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'alice' },
            { firstName: 'alice' },
            { lastName: 'alice' },
          ],
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      await expect(service.getNetworkGraphByName('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getNetworkStrengthLeaderboard', () => {
    it('should return top users by network strength', async () => {
      (
        prismaService.networkStrength.findMany as unknown as jest.Mock<
          Promise<NetworkStrengthWithUser[]>
        >
      ).mockResolvedValue([
        {
          user: {
            id: 'user1',
            username: 'alice',
            firstName: 'Alice',
            lastName: 'Wonderland',
            avatar: 'a.jpg',
          },
          strength: 10,
          calculatedAt: new Date('2025-07-01T00:00:00Z'),
        },
        {
          user: {
            id: 'user2',
            username: 'bob',
            firstName: 'Bob',
            lastName: 'Builder',
            avatar: 'b.jpg',
          },
          strength: 8,
          calculatedAt: new Date('2025-07-01T00:00:00Z'),
        },
      ]);
      const result = await service.getNetworkStrengthLeaderboard();
      expect(result).toEqual([
        {
          user: {
            id: 'user1',
            username: 'alice',
            firstName: 'Alice',
            lastName: 'Wonderland',
            avatar: 'a.jpg',
          },
          strength: 10,
          calculatedAt: new Date('2025-07-01T00:00:00Z'),
        },
        {
          user: {
            id: 'user2',
            username: 'bob',
            firstName: 'Bob',
            lastName: 'Builder',
            avatar: 'b.jpg',
          },
          strength: 8,
          calculatedAt: new Date('2025-07-01T00:00:00Z'),
        },
      ]);
      expect(prismaService.networkStrength.findMany).toHaveBeenCalled();
    });
  });

  describe('getReferralPointsLeaderboard', () => {
    it('should return top users by referral points', async () => {
      (
        prismaService.referralPoint.findMany as unknown as jest.Mock<
          Promise<ReferralPointWithUser[]>
        >
      ).mockResolvedValue([
        {
          user: {
            id: 'user1',
            username: 'alice',
            firstName: 'Alice',
            lastName: 'Wonderland',
            avatar: 'a.jpg',
          },
          points: 5,
          updatedAt: new Date('2025-07-01T00:00:00Z'),
        },
        {
          user: {
            id: 'user2',
            username: 'bob',
            firstName: 'Bob',
            lastName: 'Builder',
            avatar: 'b.jpg',
          },
          points: 3,
          updatedAt: new Date('2025-07-01T00:00:00Z'),
        },
      ]);
      const result = await service.getReferralPointsLeaderboard();
      expect(result).toEqual([
        {
          user: {
            id: 'user1',
            username: 'alice',
            firstName: 'Alice',
            lastName: 'Wonderland',
            avatar: 'a.jpg',
          },
          points: 5,
          updatedAt: new Date('2025-07-01T00:00:00Z'),
        },
        {
          user: {
            id: 'user2',
            username: 'bob',
            firstName: 'Bob',
            lastName: 'Builder',
            avatar: 'b.jpg',
          },
          points: 3,
          updatedAt: new Date('2025-07-01T00:00:00Z'),
        },
      ]);
      expect(prismaService.referralPoint.findMany).toHaveBeenCalled();
    });
  });
});
