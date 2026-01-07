/**
 * Mock Data Factories
 * 
 * Provides factory functions to create mock data for testing.
 */

export const createMockMenu = (overrides = {}) => ({
  id: 1,
  nameTH: 'ข้าวผัด',
  nameEN: 'Fried Rice',
  price: 50,
  categoryId: 1,
  description: 'Delicious fried rice',
  imageUrl: 'https://example.com/image.jpg',
  isRecommended: false,
  isAvailable: true,
  isVisible: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: 1,
  name: 'อาหารจานหลัก',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTable = (overrides = {}) => ({
  id: 1,
  name: 'A1',
  isOccupied: false,
  isAvailable: true,
  isCalling: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  tableId: 1,
  status: 'PENDING',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockBill = (overrides = {}) => ({
  id: 1,
  tableId: 1,
  totalPrice: 500,
  status: 'OPEN',
  paymentMethod: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  closedAt: null,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'admin',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
