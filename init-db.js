#!/usr/bin/env node

import { exec } from 'child_process';

// Wait for database to be ready before running migrations
const waitForDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Waiting for database to be ready...');
    
    let attempts = 0;
    const maxAttempts = 15;
    
    const interval = setInterval(() => {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} to initialize the database...`);
      
      exec('npm run db:push', (error, stdout, stderr) => {
        if (!error) {
          console.log('Database schema pushed successfully!');
          console.log(stdout);
          clearInterval(interval);
          resolve();
        } else {
          console.log('Database not ready yet, waiting...');
          if (stderr) console.error(stderr);
          
          // If we've reached max attempts, fail
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error(`Failed to initialize database after ${maxAttempts} attempts`));
          }
        }
      });
    }, 2000);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Database connection timeout after 30 seconds'));
    }, 30000);
  });
};

waitForDatabase()
  .then(() => {
    console.log('Database schema has been initialized successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });