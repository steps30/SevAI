import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen when user is not authenticated', () => {
  localStorage.removeItem('isLoggedIn');
  render(<App />);
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});
