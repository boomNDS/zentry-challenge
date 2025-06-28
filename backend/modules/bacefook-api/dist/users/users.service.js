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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto) {
        this.logger.log(`Creating new user with email: ${createUserDto.email}`);
        try {
            const user = await this.prisma.user.create({
                data: createUserDto,
            });
            this.logger.log(`User created successfully with ID: ${user.id}`);
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`, error.stack);
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('User with this email or username already exists');
            }
            throw error;
        }
    }
    async findAll() {
        this.logger.log('Retrieving all users');
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
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        this.logger.log(`Retrieved ${users.length} users`);
        return users;
    }
    async findOne(id) {
        this.logger.log(`Retrieving user with ID: ${id}`);
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
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
                posts: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        imageUrl: true,
                        createdAt: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            this.logger.warn(`User with ID ${id} not found`);
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        this.logger.log(`User retrieved successfully: ${user.username}`);
        return user;
    }
    async update(id, updateUserDto) {
        this.logger.log(`Updating user with ID: ${id}`);
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: updateUserDto,
            });
            this.logger.log(`User updated successfully: ${user.username}`);
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to update user ${id}: ${error.message}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('User with this email or username already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        this.logger.log(`Deleting user with ID: ${id}`);
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            this.logger.log(`User deleted successfully: ${id}`);
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${id}: ${error.message}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map