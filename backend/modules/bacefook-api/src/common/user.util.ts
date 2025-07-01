import { UserWithRelations } from '../types/user-profile.type';

export function mapUserProfile(user: UserWithRelations) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    friends: user.friends ?? [],
    referrals: user.referrals ?? [],
    referralPoints: user.referralPoints?.[0]?.points ?? 0,
    networkStrength: user.networkStrength?.strength ?? 0,
  };
}
