import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous content, keeping only text
 * 
 * @param input - String to sanitize
 * @returns Sanitized string with HTML tags removed
 * 
 * @example
 * sanitizeHtml("<script>alert('XSS')</script>") // Returns: "alert('XSS')"
 * sanitizeHtml("<img src=x onerror='alert(1)'>") // Returns: ""
 * sanitizeHtml("ข้าวผัด") // Returns: "ข้าวผัด"
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return input;
  
  // Remove all HTML tags, keep only text content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],        // Don't allow any HTML tags
    ALLOWED_ATTR: [],        // Don't allow any attributes
    KEEP_CONTENT: true,      // Keep text content
  });
}

/**
 * Sanitize specific fields in an object
 * 
 * @param obj - Object to sanitize
 * @param fields - Array of field names to sanitize
 * @returns New object with sanitized fields
 * 
 * @example
 * sanitizeObject({ name: "<script>XSS</script>", price: 100 }, ['name'])
 * // Returns: { name: "XSS", price: 100 }
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj };
  
  for (const field of fields) {
    const value = sanitized[field];
    
    if (typeof value === 'string') {
      sanitized[field] = sanitizeHtml(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      // Handle arrays (e.g., order items with notes)
      sanitized[field] = value.map((item: any) => {
        if (typeof item === 'string') {
          return sanitizeHtml(item);
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item, fields);
        }
        return item;
      }) as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Sanitize array of items with specific fields
 * 
 * @param items - Array of items to sanitize
 * @param fields - Array of field names to sanitize in each item
 * @returns New array with sanitized items
 * 
 * @example
 * sanitizeArray([{ note: "<script>XSS</script>" }], ['note'])
 * // Returns: [{ note: "XSS" }]
 */
export function sanitizeArray<T extends Record<string, any>>(
  items: T[],
  fields: (keyof T)[]
): T[] {
  return items.map(item => sanitizeObject(item, fields));
}
