import { render, screen } from '@testing-library/react-native';

import { QueryErrorView } from './QueryErrorView';

const errorWith = (code: string) => ({ code, message: code });

describe('QueryErrorView', () => {
  it('explains a list error and offers a retry when retrying can help', async () => {
    await render(<QueryErrorView compact error={errorWith('network')} onRetry={jest.fn()} />);

    expect(screen.getByText("Can't connect")).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it("doesn't blame the connection or offer a retry for a bug in our own code", async () => {
    await render(<QueryErrorView compact error={errorWith('unknown')} onRetry={jest.fn()} />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.queryByText("Can't connect")).toBeNull();
    expect(screen.queryByText('Retry')).toBeNull();
  });

  it('shows nothing inline for an app-wide error, which the banner explains', async () => {
    await render(<QueryErrorView compact error={errorWith('rate-limited')} onRetry={jest.fn()} />);

    expect(screen.toJSON()).toBeNull();
  });

  it('shows a neutral full-screen state for an app-wide error, without repeating the reason', async () => {
    await render(<QueryErrorView error={errorWith('rate-limited')} onRetry={jest.fn()} />);

    expect(screen.getByText('Movies are unavailable right now')).toBeTruthy();
    expect(screen.queryByText('Daily limit reached')).toBeNull();
    expect(screen.queryByText('Retry')).toBeNull();
  });
});
