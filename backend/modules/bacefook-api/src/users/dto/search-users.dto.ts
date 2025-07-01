import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class UserProfileDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() username: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() bio: string;
  @ApiProperty() avatar: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  @ApiProperty({
    type: [Object],
    description: 'List of friends',
  })
  friends: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;

  @ApiProperty({
    type: [Object],
    description: 'List of referrals',
  })
  referrals: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;

  @ApiProperty({
    type: [Object],
    required: false,
  })
  referralPoints?: Array<{
    points: number;
  }>;

  @ApiProperty({
    type: Object,
    required: false,
  })
  networkStrength?: {
    strength: number;
  } | null;
}
