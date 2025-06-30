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
        return user;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
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
        return users;
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
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
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
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
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
        return user;
    }
    async remove(id) {
        const existingUser = await this.prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.prisma.user.delete({
            where: { id },
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