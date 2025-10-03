import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app';

import type { Server } from "http";

let server: Server;

describe('API /', () => {
  beforeAll(() => {
    const app = createApp();
    server = app.listen(3000);
  });
  
  it('should return status 200', async () => {
    createApp();
    
    const res = await fetch('http://localhost:3000');
    expect(res.status).toBe(200);
  });
});