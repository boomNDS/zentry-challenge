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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  SearchUsersDto,
  UserProfileDto,
} from './dto';
import { FriendDto, FriendResponseDto } from './dto/friend.dto';
import { ApiPaginatedResponse } from '../common/dto/paginated-response.dto';

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
  @ApiOkResponse({ description: 'List of users retrieved successfully' })
  @ApiPaginatedResponse(UserProfileDto)
  async findAll(@Query() query: SearchUsersDto) {
    return this.usersService.findAll(query);
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

  @Post(':id/friends')
  @ApiOperation({
    summary: 'Add a friend',
    description: 'Add a friend by user ID',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: FriendDto, description: 'Friend ID to add' })
  @ApiResponse({ status: 200, description: 'Friend added successfully' })
  async addFriend(@Param('id') id: string, @Body() body: FriendDto) {
    return this.usersService.addFriend({
      id,
      friendId: body.friendId,
    });
  }

  @Delete(':id/friends/:friendId')
  @ApiOperation({
    summary: 'Remove a friend',
    description: 'Remove a friend by user ID',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: FriendDto, description: 'Friend ID to remove' })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  async removeFriend(@Param('id') id: string, @Body() body: FriendDto) {
    return this.usersService.removeFriend({ id, friendId: body.friendId });
  }

  @Get(':id/friends')
  @ApiOperation({
    summary: 'Get paginated friends list',
    description: 'Returns a paginated list of a user’s friends',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'Paginated friends list' })
  @ApiPaginatedResponse(FriendResponseDto)
  async getFriends(@Param('id') id: string, @Query() query: SearchUsersDto) {
    return this.usersService.getFriends(id, query);
  }
}
