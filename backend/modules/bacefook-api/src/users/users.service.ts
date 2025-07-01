import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, SearchUsersDto, UpdateUserDto } from './dto';
import { mapUserProfile } from '../common/user.util';
import { IFriend } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const { search, page = 1, limit = 10 } = query;

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

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      friends: user.friends,
      referrals: user.referrals,
      referralPoints: user.referralPoints?.[0]?.points ?? 0,
      networkStrength: user.networkStrength?.strength ?? 0,
    }));

    return {
      data: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

    return mapUserProfile(user);
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
}
