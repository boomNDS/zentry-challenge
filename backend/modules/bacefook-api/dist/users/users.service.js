"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const user_util_1 = require("../common/user.util");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: createUserDto.email },
                    { username: createUserDto.username },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or username already exists');
        }
        let referredById = undefined;
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
        return (0, user_util_1.mapUserProfile)({
            ...user,
            friends: [],
            referrals: [],
            referralPoints: [],
            networkStrength: { strength: 0 },
        });
    }
    async findAll(query) {
        const { search, page = 1, limit = 10 } = query;
        const where = search
            ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return (0, user_util_1.mapUserProfile)(user);
    }
    async update(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
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
                throw new common_1.ConflictException('User with this email or username already exists');
            }
        }
        await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
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
        return (0, user_util_1.mapUserProfile)(userWithRelations);
    }
    async remove(id) {
        const existingUser = await this.prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map