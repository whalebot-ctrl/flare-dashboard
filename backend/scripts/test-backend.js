import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const testBackend = async () => {
  try {
    // Check if BACKEND_URL is defined
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    console.log(`Testing backend at: ${backendUrl}`);

    // Test the root endpoint
    console.log('\n1. Testing root endpoint...');
    try {
      const rootResponse = await fetch(`${backendUrl}`);
      const rootData = await rootResponse.json();
      console.log(`✅ Root endpoint response: ${JSON.stringify(rootData)}`);
    } catch (error) {
      console.error(`❌ Root endpoint error: ${error.message}`);
    }

    // Test the users/me endpoint with a test email
    console.log('\n2. Testing /api/users/me endpoint...');
    try {
      const testEmail = 'alex.johnson@example.com'; // Use an email that exists in your database
      const usersResponse = await fetch(`${backendUrl}/api/users/me`, {
        headers: {
          'X-User-Email': testEmail,
        },
      });

      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        console.log(
          `✅ Users/me endpoint response: ${JSON.stringify(userData)}`
        );
      } else {
        const errorText = await usersResponse.text();
        console.error(
          `❌ Users/me endpoint returned status ${usersResponse.status}: ${errorText}`
        );
      }
    } catch (error) {
      console.error(`❌ Users/me endpoint error: ${error.message}`);
    }

    console.log('\nTests completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testBackend();
