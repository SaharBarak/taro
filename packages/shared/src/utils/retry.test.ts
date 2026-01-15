/**
 * Tests for Retry Utility
 *
 * The retry utility provides exponential backoff for failed operations.
 * This is used throughout the platform for resilient API calls, especially
 * for external services like payment processing and blockchain operations.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  retry,
  withRetry,
  RetryPredicates,
  RetryErrorMessages,
} from './retry';

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await retry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockRejectedValueOnce(new Error('Second fail'))
      .mockResolvedValue('success');

    const promise = retry(fn, { maxAttempts: 3, jitter: false });

    // Fast-forward through delays
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after max attempts exceeded', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    // Attach catch handler immediately to prevent unhandled rejection
    const promise = retry(fn, { maxAttempts: 3, jitter: false }).catch(
      (e) => e
    );

    // Run all timers to completion
    await vi.runAllTimersAsync();

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects isRetryable predicate', async () => {
    const retryableError = new Error('Retryable');
    const nonRetryableError = new Error('Not retryable');

    const fn = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(nonRetryableError);

    const isRetryable = (error: unknown) =>
      error instanceof Error && error.message === 'Retryable';

    // Attach catch handler immediately to prevent unhandled rejection
    const promise = retry(fn, { maxAttempts: 5, isRetryable, jitter: false }).catch(
      (e) => e
    );

    // Run all timers to completion
    await vi.runAllTimersAsync();

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('Not retryable');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('calls onRetry callback before each retry', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    const promise = retry(fn, { maxAttempts: 3, onRetry, jitter: false });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    await promise;

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(
      1,
      expect.any(Error),
      1,
      expect.any(Number)
    );
    expect(onRetry).toHaveBeenNthCalledWith(
      2,
      expect.any(Error),
      2,
      expect.any(Number)
    );
  });

  it('uses exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    const promise = retry(fn, {
      maxAttempts: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
      onRetry,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    await promise;

    // First retry: 1000ms, Second retry: 2000ms
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1, 1000);
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2, 2000);
  });

  it('respects maxDelay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockRejectedValueOnce(new Error('Fail'))
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    const promise = retry(fn, {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 2000,
      backoffMultiplier: 2,
      jitter: false,
      onRetry,
    });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(2000);

    await promise;

    // Third delay would be 4000ms but capped at 2000ms
    expect(onRetry).toHaveBeenNthCalledWith(3, expect.any(Error), 3, 2000);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wraps function with retry logic', async () => {
    const originalFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const wrappedFn = withRetry(originalFn, { maxAttempts: 2, jitter: false });

    const promise = wrappedFn();
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(result).toBe('success');
    expect(originalFn).toHaveBeenCalledTimes(2);
  });

  it('preserves function arguments', async () => {
    const originalFn = vi.fn().mockResolvedValue('success');
    const wrappedFn = withRetry(originalFn, { maxAttempts: 3 });

    await wrappedFn('arg1', 'arg2');

    expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('RetryPredicates', () => {
  describe('isNetworkError', () => {
    it('returns true for network errors', () => {
      expect(RetryPredicates.isNetworkError(new Error('network error'))).toBe(
        true
      );
      expect(RetryPredicates.isNetworkError(new Error('fetch failed'))).toBe(
        true
      );
      expect(RetryPredicates.isNetworkError(new Error('timeout'))).toBe(true);
      expect(RetryPredicates.isNetworkError(new Error('ECONNREFUSED'))).toBe(
        true
      );
      expect(RetryPredicates.isNetworkError(new Error('ENOTFOUND'))).toBe(true);
    });

    it('returns false for non-network errors', () => {
      expect(RetryPredicates.isNetworkError(new Error('validation error'))).toBe(
        false
      );
      expect(RetryPredicates.isNetworkError(null)).toBe(false);
      expect(RetryPredicates.isNetworkError('string error')).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('returns true for 5xx status codes', () => {
      expect(RetryPredicates.isServerError({ status: 500 })).toBe(true);
      expect(RetryPredicates.isServerError({ status: 502 })).toBe(true);
      expect(RetryPredicates.isServerError({ status: 503 })).toBe(true);
      expect(RetryPredicates.isServerError({ status: 599 })).toBe(true);
    });

    it('returns false for non-5xx status codes', () => {
      expect(RetryPredicates.isServerError({ status: 400 })).toBe(false);
      expect(RetryPredicates.isServerError({ status: 404 })).toBe(false);
      expect(RetryPredicates.isServerError({ status: 200 })).toBe(false);
    });

    it('returns false for non-status objects', () => {
      expect(RetryPredicates.isServerError(new Error('error'))).toBe(false);
      expect(RetryPredicates.isServerError(null)).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('returns true for 429 status code', () => {
      expect(RetryPredicates.isRateLimitError({ status: 429 })).toBe(true);
    });

    it('returns false for other status codes', () => {
      expect(RetryPredicates.isRateLimitError({ status: 400 })).toBe(false);
      expect(RetryPredicates.isRateLimitError({ status: 500 })).toBe(false);
    });
  });

  describe('isTransientError', () => {
    it('returns true for any transient error type', () => {
      expect(RetryPredicates.isTransientError(new Error('network'))).toBe(true);
      expect(RetryPredicates.isTransientError({ status: 500 })).toBe(true);
      expect(RetryPredicates.isTransientError({ status: 429 })).toBe(true);
    });

    it('returns false for non-transient errors', () => {
      expect(RetryPredicates.isTransientError(new Error('validation'))).toBe(
        false
      );
      expect(RetryPredicates.isTransientError({ status: 400 })).toBe(false);
    });
  });
});

describe('RetryErrorMessages', () => {
  it('has Hebrew error messages', () => {
    expect(RetryErrorMessages.MAX_ATTEMPTS_EXCEEDED).toContain('נכשלה');
    expect(RetryErrorMessages.NETWORK_ERROR).toContain('רשת');
    expect(RetryErrorMessages.SERVER_ERROR).toContain('שרת');
    expect(RetryErrorMessages.RATE_LIMITED).toContain('בקשות');
  });
});
