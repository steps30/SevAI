import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

// 1. Setup a Mock for the browser's localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SevAI App Routing and Authentication', () => {

  // Clear the DOM and localStorage after every test to prevent data leaking
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('1. Redirects to Role Selection when user is completely unauthenticated', () => {
    // Ensure storage is empty
    window.localStorage.clear();

    render(<App />);

    // It should redirect to /role-select and show the "Choose Login Type" title
    const heading = screen.getByRole('heading', { name: /Choose Login Type/i });
    expect(heading).toBeInTheDocument();
  });

  test('2. Renders Home Page when logged in as a Citizen (User)', () => {
    // Mock the state of a logged-in citizen
    window.localStorage.setItem('isLoggedIn', 'true');
    window.localStorage.setItem('loginRole', 'user');
    window.localStorage.setItem('currentUserEmail', 'user@gmail.com');

    render(<App />);

    // It should render the Home page with the "Submit Complaint" CTA
    const submitBtn = screen.getByRole('button', { name: /Submit Complaint/i });
    expect(submitBtn).toBeInTheDocument();

    // The Admin Panel should NOT be visible
    expect(screen.queryByText(/Admin Control Room/i)).not.toBeInTheDocument();
  });

  test('3. Renders Admin Panel when logged in as an Official (Admin)', () => {
    // Mock the state of a logged-in Official
    window.localStorage.setItem('isLoggedIn', 'true');
    window.localStorage.setItem('loginRole', 'admin');
    window.localStorage.setItem('adminDepartment', 'PWD - Roads & Infrastructure');

    render(<App />);

    // It should redirect directly to the Admin Panel
    const adminHeading = screen.getByRole('heading', { name: /Control Room|Command Center/i });
    expect(adminHeading).toBeInTheDocument();

    // The regular citizen Home page should NOT be visible
    expect(screen.queryByText(/Submit Complaint/i)).not.toBeInTheDocument();
  });
});