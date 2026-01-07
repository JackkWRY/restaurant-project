import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function with providers
 * 
 * Wraps components with necessary providers (Zustand, SWR, etc.)
 * for testing in isolation.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  // Add providers here as needed
  // Example: <SWRConfig><ZustandProvider>{children}</ZustandProvider></SWRConfig>
  return <>{children}</>;
}

/**
 * Render with all providers
 * 
 * @param ui - React component to render
 * @param options - Render options
 * @returns Render result with queries
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
