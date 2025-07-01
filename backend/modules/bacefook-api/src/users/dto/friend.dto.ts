import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class FriendDto {
  @IsNotEmpty()
  @IsString()
  friendId?: string;
}

export class FriendResponseDto {
  @ApiProperty({ example: 'cmcjfsv3b0000t0rrq0qmo1d5' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'alice' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Alice' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Wonderland' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  @IsOptional()
  @IsString()
  avatar: string | null;
}
