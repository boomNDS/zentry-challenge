import type { User, ReferralPoint, NetworkStrength } from '@prisma/client';

export type UserWithRelations = User & {
  friends: Array<
    Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'avatar'>
  >;
  referrals: Array<
    Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'avatar'>
  >;
  referralPoints?: Array<Pick<ReferralPoint, 'points'>>;
  networkStrength?: Pick<NetworkStrength, 'strength'> | null;
};
