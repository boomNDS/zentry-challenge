import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email or username already exists',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users with their basic information',
  })
  @ApiResponse({
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
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed information about a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890abcdef',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890abcdef',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email or username already exists',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently deletes a user account',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890abcdef',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
