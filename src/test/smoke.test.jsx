import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/study']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('utilities', () => {
  it('formats dates correctly', async () => {
    const { formatFull } = await import('../utils/dates');
    const result = formatFull('2024-01-15T12:00:00.000Z');
    expect(result).toContain('2024');
  });
});
