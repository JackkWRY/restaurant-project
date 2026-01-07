/**
 * @file Setting Schema Tests
 * @description Unit tests for setting Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import { updateSettingSchema } from '../../../api/schemas/settingSchema.js';

describe('SettingSchema', () => {
  describe('updateSettingSchema', () => {
    it('should validate valid restaurant name', () => {
      const result = updateSettingSchema.safeParse({ name: 'ร้านอาหารไทย' });
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const result = updateSettingSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = updateSettingSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be empty');
      }
    });
  });
});
