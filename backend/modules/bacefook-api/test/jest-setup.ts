// Jest setup file for global test configuration
import 'reflect-metadata';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global test utilities
global.beforeEach(() => {
  // Reset any global state before each test
});

global.afterEach(() => {
  // Clean up after each test
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
