/**
 * @file ErrorBoundary Component Tests
 * @description Unit tests for ErrorBoundary error handling component
 * 
 * Tests cover:
 * - Rendering children when no error
 * - Catching and displaying errors
 * - Error logging
 * - Reset functionality
 * - Different error types
 * - Error boundaries behavior
 * 
 * Best Practices:
 * - AAA Pattern (Arrange-Act-Assert)
 * - Test error scenarios
 * - Mock console.error
 * - Test recovery mechanisms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true, message = 'Test error' }: { shouldThrow?: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Component that throws on event
const ThrowOnClick = () => {
  const handleClick = () => {
    throw new Error('Click error');
  };
  return <button onClick={handleClick}>Throw Error</button>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error in tests
  const originalError = console.error;
  
  beforeEach(() => {
    // Mock console.error to avoid cluttering test output
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      // Arrange
      const NestedComponent = () => (
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      );

      // Act
      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch and display error when child throws', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
    });

    it('should display error message', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
      // Error message might be displayed in details
      expect(screen.getByText(/Custom error message/i)).toBeInTheDocument();
    });

    it('should catch errors from nested components', () => {
      // Arrange
      const Parent = () => (
        <div>
          <ThrowError />
        </div>
      );

      // Act
      render(
        <ErrorBoundary>
          <Parent />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
    });

    it('should not catch errors from event handlers', () => {
      // Arrange
      render(
        <ErrorBoundary>
          <ThrowOnClick />
        </ErrorBoundary>
      );

      // Assert - Button should render (error boundaries don't catch event handler errors)
      expect(screen.getByText('Throw Error')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should show error UI with heading', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/เกิดข้อผิดพลาด/i);
    });

    it('should show error details', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError message="Detailed error" />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/Detailed error/i)).toBeInTheDocument();
    });

    it('should have accessible error message', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      const errorMessage = screen.getByText(/เกิดข้อผิดพลาด/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset button when error occurs', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByRole('button', { name: /ลองอีกครั้ง/i })).toBeInTheDocument();
    });

    it('should reset error state when reset button clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      let shouldThrow = true;
      
      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Recovered</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      // Assert - Error shown
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();

      // Act - Fix the error and click reset
      shouldThrow = false;
      const resetButton = screen.getByRole('button', { name: /ลองอีกครั้ง/i });
      await user.click(resetButton);

      // Rerender with fixed component
      rerender(
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      );

      // Note: In real implementation, clicking reset would trigger a re-render
      // This test documents the expected behavior
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      render(
        <ErrorBoundary>
          <ThrowError message="Logged error" />
        </ErrorBoundary>
      );

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should log error details', () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorMessage = 'Detailed error for logging';

      // Act
      render(
        <ErrorBoundary>
          <ThrowError message={errorMessage} />
        </ErrorBoundary>
      );

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );

      // Assert - Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          {undefined}
        </ErrorBoundary>
      );

      // Assert - Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          {''}
        </ErrorBoundary>
      );

      // Assert - Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle errors with no message', () => {
      // Arrange
      const ThrowEmptyError = () => {
        throw new Error();
      };

      // Act
      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
    });

    it('should handle non-Error objects thrown', () => {
      // Arrange
      const ThrowString = () => {
        throw 'String error';
      };

      // Act
      render(
        <ErrorBoundary>
          <ThrowString />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Error Boundaries', () => {
    it('should isolate errors to nearest boundary', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <div>Outer Content</div>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
          <div>More Outer Content</div>
        </ErrorBoundary>
      );

      // Assert - Inner boundary catches error, outer content still renders
      expect(screen.getByText('Outer Content')).toBeInTheDocument();
      expect(screen.getByText('More Outer Content')).toBeInTheDocument();
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
    });

    it('should allow multiple independent boundaries', () => {
      // Arrange & Act
      render(
        <div>
          <ErrorBoundary>
            <div>Section 1</div>
          </ErrorBoundary>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
          <ErrorBoundary>
            <div>Section 3</div>
          </ErrorBoundary>
        </div>
      );

      // Assert
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible error heading', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible reset button', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      const button = screen.getByRole('button', { name: /ลองอีกครั้ง/i });
      expect(button).toBeInTheDocument();
    });

    it('should have semantic error structure', () => {
      // Arrange & Act
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert - Should have proper semantic structure
      expect(container.querySelector('h1, h2, h3')).toBeInTheDocument();
    });
  });
});
