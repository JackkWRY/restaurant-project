/**
 * @file Cart Store Tests
 * @description Unit tests for Zustand cart store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/store/useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
      result.current.setTableId(0);
    });
  });

  describe('setTableId', () => {
    it('should set table id', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.setTableId(5);
      });

      expect(result.current.tableId).toBe(5);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCartStore());
      const newItem = { id: 1, nameTH: 'ข้าวผัด', price: 50 };

      act(() => {
        result.current.addItem(newItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        ...newItem,
        quantity: 1,
      });
    });

    it('should increment quantity if item already exists', () => {
      const { result } = renderHook(() => useCartStore());
      const item = { id: 1, nameTH: 'ข้าวผัด', price: 50 };

      act(() => {
        result.current.addItem(item);
        result.current.addItem(item);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('increaseQuantity', () => {
    it('should increase item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.increaseQuantity(1);
      });

      expect(result.current.items[0].quantity).toBe(2);
    });
  });

  describe('decreaseQuantity', () => {
    it('should decrease item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.increaseQuantity(1);
        result.current.decreaseQuantity(1);
      });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should remove item when quantity reaches 0', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.decreaseQuantity(1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('updateNote', () => {
    it('should update item note', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.updateNote(1, 'No spicy');
      });

      expect(result.current.items[0].note).toBe('No spicy');
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.addItem({ id: 2, nameTH: 'ผัดไทย', price: 60 });
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('totalPrice', () => {
    it('should calculate total price', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.addItem({ id: 2, nameTH: 'ผัดไทย', price: 60 });
      });

      expect(result.current.totalPrice()).toBe(110);
    });

    it('should calculate total with quantities', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.increaseQuantity(1);
      });

      expect(result.current.totalPrice()).toBe(100);
    });
  });

  describe('totalItems', () => {
    it('should calculate total items count', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem({ id: 1, nameTH: 'ข้าวผัด', price: 50 });
        result.current.increaseQuantity(1);
        result.current.addItem({ id: 2, nameTH: 'ผัดไทย', price: 60 });
      });

      expect(result.current.totalItems()).toBe(3);
    });
  });
});
