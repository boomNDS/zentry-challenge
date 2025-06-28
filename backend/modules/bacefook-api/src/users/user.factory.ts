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
    posts: [],
    comments: [],
    likes: [],
    followers: [],
    following: [],
    ...overrides,
  };
}

export function createMockUserWithCounts(overrides = {}) {
  return {
    ...createMockUser(overrides),
    _count: {
      posts: 5,
      followers: 10,
      following: 8,
    },
  };
}

export function createMockUserWithDetails(overrides = {}) {
  return {
    ...createMockUserWithCounts(overrides),
    posts: [
      {
        id: 'post123',
        content: 'Hello world!',
        imageUrl: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        _count: {
          likes: 3,
          comments: 2,
        },
      },
    ],
  };
}
