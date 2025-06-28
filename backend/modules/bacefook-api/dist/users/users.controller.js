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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new user',
        description: 'Creates a new user account with the provided information',
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreateUserDto,
        description: 'User creation data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User created successfully',
        schema: {
            example: {
                id: 'clx1234567890abcdef',
                email: 'john.doe@example.com',
                username: 'john_doe',
                firstName: 'John',
                lastName: 'Doe',
                bio: 'Software developer',
                avatar: 'https://example.com/avatar.jpg',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - User with this email or username already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users',
        description: 'Retrieves a list of all users with their basic information',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of users retrieved successfully',
        schema: {
            example: [
                {
                    id: 'clx1234567890abcdef',
                    email: 'john.doe@example.com',
                    username: 'john_doe',
                    firstName: 'John',
                    lastName: 'Doe',
                    bio: 'Software developer',
                    avatar: 'https://example.com/avatar.jpg',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    _count: {
                        posts: 5,
                        followers: 10,
                        following: 8,
                    },
                },
            ],
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Retrieves detailed information about a specific user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: 'clx1234567890abcdef',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User details retrieved successfully',
        schema: {
            example: {
                id: 'clx1234567890abcdef',
                email: 'john.doe@example.com',
                username: 'john_doe',
                firstName: 'John',
                lastName: 'Doe',
                bio: 'Software developer',
                avatar: 'https://example.com/avatar.jpg',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                _count: {
                    posts: 5,
                    followers: 10,
                    following: 8,
                },
                posts: [
                    {
                        id: 'clx1234567890abcdef',
                        content: 'Hello world!',
                        imageUrl: null,
                        createdAt: '2024-01-01T00:00:00.000Z',
                        _count: {
                            likes: 3,
                            comments: 2,
                        },
                    },
                ],
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user',
        description: 'Updates user information with the provided data',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: 'clx1234567890abcdef',
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.UpdateUserDto,
        description: 'User update data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - User with this email or username already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete user',
        description: 'Permanently deletes a user account',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User ID',
        example: 'clx1234567890abcdef',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'User deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map