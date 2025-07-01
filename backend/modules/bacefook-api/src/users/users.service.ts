import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, SearchUsersDto, UpdateUserDto } from './dto';
import { mapUserProfile } from '../common/user.util';
import { IFriend } from './interface/user.interface';
import { ReferralPointService } from '../referral-point/referral-point.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private referralPointService: ReferralPointService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    let referredById: string | undefined = undefined;
    if (createUserDto.referredById) {
      const refUser = await this.prisma.user.findUnique({
        where: { id: createUserDto.referredById },
        select: { id: true },
      });
      if (refUser) {
        referredById = refUser.id;
      }
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        referredById,
      },
    });

    await this.referralPointService.awardReferralPoints(user.id, referredById);

    // Update network strength
    await this.updateNetworkStrength(user.id);

    await this.prisma.event.create({
      data: {
        type: 'register',
        data: {
          ...createUserDto,
          referredById,
          userId: user.id,
          createdAt: user.createdAt,
        },
        processed: true,
      },
    });

    if (referredById) {
      await this.prisma.event.create({
        data: {
          type: 'referral',
          data: {
            referredBy: referredById,
            user: user.id,
            createdAt: user.createdAt,
          },
          processed: true,
        },
      });
    }

    return mapUserProfile({
      ...user,
      friends: [],
      referrals: [],
      referralPoints: [],
      networkStrength: { strength: 0 },
    });
  }

  async findAll(query: SearchUsersDto) {
    const search = query.search?.trim();
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const currentPage = Math.min(page, totalPages);

    const formattedUsers =
      users?.map((user) =>
        mapUserProfile({
          ...user,
          friends: [],
          referrals: [],
          referralPoints: [],
          networkStrength: { strength: 0 },
        }),
      ) || [];

    return {
      data: formattedUsers,
      total,
      page: currentPage,
      limit,
      totalPages,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const networkStrength = await this.calculateNetworkStrength(id);

    return mapUserProfile({
      ...user,
      networkStrength: { strength: networkStrength },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for unique email/username conflicts.
    if (updateUserDto.email || updateUserDto.username) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            updateUserDto.email ? { email: updateUserDto.email } : undefined,
            updateUserDto.username
              ? { username: updateUserDto.username }
              : undefined,
          ].filter(Boolean),
          NOT: { id },
        },
      });
      if (conflictUser) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
    }

    // Update the user
    await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Fetch the updated user with relations
    const userWithRelations = await this.prisma.user.findUnique({
      where: { id },
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

    await this.prisma.event.create({
      data: {
        type: 'updated',
        data: {
          ...updateUserDto,
          userId: id,
          updatedAt: userWithRelations?.updatedAt,
        },
        processed: true,
      },
    });

    return mapUserProfile(userWithRelations);
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    await this.prisma.event.create({
      data: {
        type: 'deleted',
        data: {
          userId: id,
        },
        processed: true,
      },
    });

    return { message: 'User deleted successfully' };
  }

  async addFriend({ id, friendId }: IFriend) {
    if (id === friendId) {
      throw new ConflictException('You cannot be friends with yourself');
    }
    const [user, friend] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: friendId } }),
    ]);
    if (!user || !friend)
      throw new NotFoundException('User or friend not found');

    // Connect both ways for bi-directional friendship
    await this.prisma.user.update({
      where: { id },
      data: { friends: { connect: { id: friendId } } },
    });
    await this.prisma.user.update({
      where: { id: friendId },
      data: { friends: { connect: { id } } },
    });

    // Update network strength for both users
    await this.updateNetworkStrength(id);
    await this.updateNetworkStrength(friendId);

    await this.prisma.event.create({
      data: {
        type: 'addfriend',
        data: {
          user1Id: id,
          user2Id: friendId,
          createdAt: new Date(),
        },
        processed: true,
      },
    });

    return { message: 'Friend added successfully' };
  }

  async removeFriend({ id, friendId }: IFriend) {
    const [user, friend] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: friendId } }),
    ]);
    if (!user || !friend)
      throw new NotFoundException('User or friend not found');

    // Disconnect both ways for bi-directional friendship
    await this.prisma.user.update({
      where: { id },
      data: { friends: { disconnect: { id: friendId } } },
    });
    await this.prisma.user.update({
      where: { id: friendId },
      data: { friends: { disconnect: { id } } },
    });

    // Update network strength for both users
    await this.updateNetworkStrength(id);
    await this.updateNetworkStrength(friendId);

    await this.prisma.event.create({
      data: {
        type: 'unfriend',
        data: {
          user1Id: id,
          user2Id: friendId,
          createdAt: new Date(),
        },
        processed: true,
      },
    });

    return { message: 'Friend removed successfully' };
  }

  async getFriends(id: string, query: SearchUsersDto) {
    const limit = query.limit ?? 10;
    const page = query.page ?? 1;

    const userWithCount = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { friends: true } } },
    });

    if (!userWithCount) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const total = userWithCount._count.friends;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const skip = (currentPage - 1) * limit;

    const userWithFriends = await this.prisma.user.findUnique({
      where: { id },
      include: {
        friends: {
          skip,
          take: limit,
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!userWithFriends) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      data: userWithFriends.friends,
      total,
      page: currentPage,
      limit,
      totalPages,
    };
  }

  async calculateNetworkStrength(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: true,
        referrals: true,
        referredBy: true,
      },
    });
    if (!user) return 0;
    const friendCount = user.friends.length;
    const referralCount = user.referrals.length;
    const hasReferrer = user.referredBy ? 1 : 0;
    return friendCount + referralCount + hasReferrer;
  }

  async updateNetworkStrength(userId: string) {
    const strength = await this.calculateNetworkStrength(userId);
    await this.prisma.networkStrength.upsert({
      where: { userId },
      update: { strength, calculatedAt: new Date() },
      create: { userId, strength },
    });
  }

  async getReferralCount(userId: string, from: string, to: string) {
    const count = await this.prisma.user.count({
      where: {
        referredById: userId,
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });
    return { count };
  }

  async getReferralTimeseries(userId: string, from: string, to: string) {
    const referrals = await this.prisma.user.findMany({
      where: {
        referredById: userId,
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      select: { createdAt: true },
    });

    // Group by date (YYYY-MM-DD)
    const series: Record<string, number> = {};
    referrals.forEach((r) => {
      const date = r.createdAt.toISOString().slice(0, 10);
      series[date] = (series[date] || 0) + 1;
    });

    return {
      series: Object.entries(series).map(([date, count]) => ({ date, count })),
    };
  }

  async getFriendsCount(userId: string, from: string, to: string) {
    const count = await this.prisma.event.count({
      where: {
        type: 'addfriend',
        data: {
          path: ['user1Id'],
          equals: userId,
        },
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });
    return { count };
  }

  async getFriendsTimeseries(userId: string, from: string, to: string) {
    const events = await this.prisma.event.findMany({
      where: {
        type: 'addfriend',
        data: {
          path: ['user1Id'],
          equals: userId,
        },
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      select: { createdAt: true },
    });

    const series: Record<string, number> = {};
    events.forEach((e) => {
      const date = e.createdAt.toISOString().slice(0, 10);
      series[date] = (series[date] || 0) + 1;
    });

    return {
      series: Object.entries(series).map(([date, count]) => ({ date, count })),
    };
  }

  async getTopInfluentialFriends(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: { select: { id: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const friendIds = user.friends.map((f) => f.id);

    if (friendIds.length === 0) return [];

    const friends = await this.prisma.user.findMany({
      where: { id: { in: friendIds } },
      include: {
        networkStrength: { select: { strength: true } },
      },
      orderBy: [
        { networkStrength: { strength: 'desc' } },
        { createdAt: 'asc' },
      ],
      take: 3,
    });

    return friends.map((f) => ({
      id: f.id,
      username: f.username,
      firstName: f.firstName,
      lastName: f.lastName,
      avatar: f.avatar,
      networkStrength: f.networkStrength?.strength ?? 0,
    }));
  }
}
