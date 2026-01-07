/**
 * @file Sanitize Utility Tests
 * @description Unit tests for HTML sanitization functions
 * 
 * Tests cover:
 * - HTML tag removal
 * - XSS attack prevention (script, img, iframe, etc.)
 * - Object field sanitization
 * - Array sanitization
 * - Edge cases (null, undefined, non-strings)
 * 
 * Best Practices:
 * - Test security-critical functionality thoroughly
 * - Cover common XSS attack vectors
 * - Test edge cases
 * - Verify text content preservation
 */

import { describe, it, expect, vi } from 'vitest';
import { sanitizeHtml, sanitizeObject, sanitizeArray } from '@/core/utils/sanitize';

// Mock DOMPurify for testing
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: (input: string, config?: any) => {
      if (!input || typeof input !== 'string') return input;
      // Simple mock: remove all HTML tags
      return input.replace(/<[^>]*>/g, '');
    },
  },
}));

describe('Sanitize Utility', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      // Arrange
      const input = '<script>alert("XSS")</script>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('alert("XSS")');
      expect(result).not.toContain('<script>');
    });

    it('should remove img tags with onerror', () => {
      // Arrange
      const input = '<img src=x onerror="alert(1)">';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('');
      expect(result).not.toContain('<img');
    });

    it('should remove iframe tags', () => {
      // Arrange
      const input = '<iframe src="evil.com"></iframe>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('');
      expect(result).not.toContain('<iframe');
    });

    it('should remove all HTML tags but keep text', () => {
      // Arrange
      const input = '<div><p>Hello <strong>World</strong></p></div>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('Hello World');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should handle plain text without changes', () => {
      // Arrange
      const input = 'ข้าวผัด';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('ข้าวผัด');
    });

    it('should handle empty string', () => {
      // Arrange
      const input = '';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      // Act
      const result = sanitizeHtml(null as any);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      // Act
      const result = sanitizeHtml(undefined as any);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle non-string input', () => {
      // Act
      const result = sanitizeHtml(123 as any);

      // Assert
      expect(result).toBe(123);
    });

    it('should remove anchor tags with javascript', () => {
      // Arrange
      const input = '<a href="javascript:alert(1)">Click</a>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('Click');
      expect(result).not.toContain('javascript:');
    });

    it('should remove style tags', () => {
      // Arrange
      const input = '<style>body { background: red; }</style>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('body { background: red; }');
      expect(result).not.toContain('<style>');
    });

    it('should remove object and embed tags', () => {
      // Arrange
      const input = '<object data="evil.swf"></object>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('');
      expect(result).not.toContain('<object');
    });

    it('should handle nested HTML tags', () => {
      // Arrange
      const input = '<div><span><b>Text</b></span></div>';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('Text');
    });

    it('should handle HTML entities', () => {
      // Arrange
      const input = '&lt;script&gt;alert(1)&lt;/script&gt;';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should handle mixed content', () => {
      // Arrange
      const input = 'Hello <b>World</b> from <script>alert(1)</script> Thailand';

      // Act
      const result = sanitizeHtml(input);

      // Assert
      expect(result).toBe('Hello World from alert(1) Thailand');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize specified string fields', () => {
      // Arrange
      const obj = {
        name: '<script>XSS</script>',
        description: '<b>Bold text</b>',
        price: 100,
      };

      // Act
      const result = sanitizeObject(obj, ['name', 'description']);

      // Assert
      expect(result.name).toBe('XSS');
      expect(result.description).toBe('Bold text');
      expect(result.price).toBe(100);
    });

    it('should not modify fields not in the sanitize list', () => {
      // Arrange
      const obj = {
        name: '<script>XSS</script>',
        email: '<b>test@example.com</b>',
      };

      // Act
      const result = sanitizeObject(obj, ['name']);

      // Assert
      expect(result.name).toBe('XSS');
      expect(result.email).toBe('<b>test@example.com</b>');
    });

    it('should handle non-string fields', () => {
      // Arrange
      const obj = {
        name: '<script>XSS</script>',
        age: 25,
        active: true,
      };

      // Act
      const result = sanitizeObject(obj, ['name', 'age', 'active']);

      // Assert
      expect(result.name).toBe('XSS');
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });

    it('should handle array fields with string items', () => {
      // Arrange
      const obj = {
        tags: ['<script>tag1</script>', '<b>tag2</b>', 'tag3'],
      };

      // Act
      const result = sanitizeObject(obj, ['tags']);

      // Assert
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should not mutate original object', () => {
      // Arrange
      const obj = {
        name: '<script>XSS</script>',
      };
      const original = { ...obj };

      // Act
      sanitizeObject(obj, ['name']);

      // Assert
      expect(obj).toEqual(original);
    });

    it('should handle empty object', () => {
      // Arrange
      const obj = {};

      // Act
      const result = sanitizeObject(obj, []);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle null values', () => {
      // Arrange
      const obj = {
        name: null as any,
        description: '<b>text</b>',
      };

      // Act
      const result = sanitizeObject(obj, ['name', 'description']);

      // Assert
      expect(result.name).toBeNull();
      expect(result.description).toBe('text');
    });
  });

  describe('sanitizeArray', () => {
    it('should sanitize array of objects', () => {
      // Arrange
      const items = [
        { note: '<script>XSS</script>', quantity: 1 },
        { note: '<b>Important</b>', quantity: 2 },
      ];

      // Act
      const result = sanitizeArray(items, ['note']);

      // Assert
      expect(result[0].note).toBe('XSS');
      expect(result[0].quantity).toBe(1);
      expect(result[1].note).toBe('Important');
      expect(result[1].quantity).toBe(2);
    });

    it('should handle empty array', () => {
      // Arrange
      const items: any[] = [];

      // Act
      const result = sanitizeArray(items, ['note']);

      // Assert
      expect(result).toEqual([]);
    });

    it('should not mutate original array', () => {
      // Arrange
      const items = [{ note: '<script>XSS</script>' }];
      const original = JSON.parse(JSON.stringify(items));

      // Act
      sanitizeArray(items, ['note']);

      // Assert
      expect(items).toEqual(original);
    });

    it('should handle multiple fields', () => {
      // Arrange
      const items = [
        {
          name: '<script>Name</script>',
          description: '<b>Desc</b>',
          price: 100,
        },
      ];

      // Act
      const result = sanitizeArray(items, ['name', 'description']);

      // Assert
      expect(result[0].name).toBe('Name');
      expect(result[0].description).toBe('Desc');
      expect(result[0].price).toBe(100);
    });

    it('should handle array with mixed content', () => {
      // Arrange
      const items = [
        { note: '<script>XSS</script>' },
        { note: 'Plain text' },
        { note: '<div>HTML</div>' },
      ];

      // Act
      const result = sanitizeArray(items, ['note']);

      // Assert
      expect(result[0].note).toBe('XSS');
      expect(result[1].note).toBe('Plain text');
      expect(result[2].note).toBe('HTML');
    });
  });
});
