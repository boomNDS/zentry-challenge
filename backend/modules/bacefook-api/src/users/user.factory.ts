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
    referralPoints: 0,
    networkStrength: 0,
    ...overrides,
  };
}
