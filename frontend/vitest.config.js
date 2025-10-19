/**
 * Vitest Configuration for Frontend Testing
 * Clinic Appointment and Prescription Management System
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/test/setup.js'],
    
    // Global test utilities
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/dist/**'
      ],
      all: true,
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50
    },
    
    // Include patterns
    include: ['**/*.{test,spec}.{js,jsx}'],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    
    // Mock CSS modules
    css: false,
    
    // Timeout
    testTimeout: 10000
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
