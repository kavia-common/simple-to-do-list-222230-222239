import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ocean To‑Do title and input', () => {
  render(<App />);
  expect(screen.getByText(/Ocean To‑Do/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Add a new task/i)).toBeInTheDocument();
});
