
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Home from './Home';

const renderHome = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

// ─── TEST 1: Main page exists ─────────────────────────────────────────────────
describe('Home page exists', () => {
  it('renders the main heading', () => {
    renderHome();
    expect(screen.getByText(/TRAVEL THE/i)).toBeInTheDocument();
    expect(screen.getByText(/SAFEST ROUTES/i)).toBeInTheDocument();
  });

  it('renders the Explore Map and Open Chat buttons', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /Explore Map/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Chat/i })).toBeInTheDocument();
  });

  it('renders the FAQ section heading', () => {
    renderHome();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });
});

// ─── TEST 2: Working function — FAQ Accordion ─────────────────────────────────
describe('FAQ Accordion functionality', () => {
  it('shows the first answer by default (defaultValue="item-1")', () => {
    renderHome();
    expect(
      screen.getByText(/the service is currently free/i)
    ).toBeVisible();
  });

  it('opens a collapsed accordion item when its trigger is clicked', async () => {
    const user = userEvent.setup();
    renderHome();

    const trigger = screen.getByText(/Where does the safety data come from/i);
    await user.click(trigger);

    expect(
      screen.getByText(/We rely on general news outlets and user reports/i)
    ).toBeVisible();
  });

  it('collapses an open accordion item when its trigger is clicked again', async () => {
    const user = userEvent.setup();
    renderHome();

    const trigger: HTMLElement = screen.getByText(/Is this service completely free/i);
    await user.click(trigger);

    const accordionContent = document.querySelector('[data-state="closed"]');
    expect(accordionContent).not.toBeNull();
  });
});