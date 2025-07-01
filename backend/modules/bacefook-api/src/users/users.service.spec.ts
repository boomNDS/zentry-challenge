import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { createMockUser } from './user.factory';

type MockPrismaService = {
  user: {
    create: jest.MockedFunction<PrismaService['user']['create']>;
    findMany: jest.MockedFunction<PrismaService['user']['findMany']>;
    findUnique: jest.MockedFunction<PrismaService['user']['findUnique']>;
    findFirst: jest.MockedFunction<PrismaService['user']['findFirst']>;
    update: jest.MockedFunction<PrismaService['user']['update']>;
    delete: jest.MockedFunction<PrismaService['user']['delete']>;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: MockPrismaService;

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
            },
          } as MockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
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

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username },
          ],
        },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
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

      const updatedUser = createMockUser({ ...updateUserDto });
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
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
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
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

      const result = await service.findAll({
        search: '',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockUsersList);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              friends: true,
              referrals: true,
              referralPoints: true,
            },
          },
        },
      });
    });

    it('should return empty array when no users exist', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll({
        search: '',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual([]);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should call database findMany method', async () => {
      await service.findAll({
        search: '',
        page: 1,
        limit: 10,
      });

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const userId = 'clx1234567890abcdef';

    it('should return user with details and call database', async () => {
      const mockUser = createMockUser();
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              friends: true,
              referrals: true,
              referralPoints: true,
            },
          },
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
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              friends: true,
              referrals: true,
              referralPoints: true,
            },
          },
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
        },
      });
    });
  });
});
