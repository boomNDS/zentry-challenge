import { IsString, IsNotEmpty } from 'class-validator';

export class FriendDto {
  @IsNotEmpty()
  @IsString()
  friendId?: string;
}
