export function createMockUser(overrides = {}) {
  return {
    id: 'clx1234567890abcdef',
    email: 'john.doe@example.com',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Software developer',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    referredById: null,
    friends: [],
    referrals: [],
    referralPoints: [],
    ...overrides,
  };
}

export function createMockUserWithCounts(overrides = {}) {
  return {
    ...createMockUser(overrides),
    _count: {
      friends: 5,
      referrals: 3,
      referralPoints: 1,
    },
  };
}

export function createMockUserWithDetails(overrides = {}) {
  return {
    ...createMockUserWithCounts(overrides),
    friends: [
      {
        id: 'friend123',
        username: 'jane_doe',
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: 'https://example.com/jane-avatar.jpg',
      },
    ],
    referrals: [
      {
        id: 'referral123',
        username: 'bob_smith',
        firstName: 'Bob',
        lastName: 'Smith',
        avatar: 'https://example.com/bob-avatar.jpg',
      },
    ],
  };
}
