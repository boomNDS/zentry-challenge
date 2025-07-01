type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

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

export function createMockEvent(overrides?: Partial<MockEvent>): MockEvent {
  return {
    id: 'evt_' + Math.random().toString(36).slice(2, 10),
    type: 'addfriend',
    data: { user1Id: 'user123', user2Id: 'user456' },
    createdAt: new Date(),
    processed: true,
    ...overrides,
  };
}

type MockEvent = {
  id: string;
  type: string;
  data: JsonValue;
  createdAt: Date;
  processed: boolean;
};
