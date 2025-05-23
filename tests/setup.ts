import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import "react-intersection-observer/test-utils";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());


// Mock scrollTo
window.scrollTo = vi.fn();
global.URL.createObjectURL = vi.fn();