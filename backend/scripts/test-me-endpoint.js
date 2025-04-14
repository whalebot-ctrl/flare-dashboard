import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const testMeEndpoint = async () => {
  try {
    // Check if BACKEND_URL is defined
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const testEmail = 'alex.johnson@example.com'; // Use an email that exists in your database

    console.log(`Testing /api/users/me endpoint at: ${backendUrl}`);
    console.log(`Using test email: ${testEmail}`);

    try {
      const response = await fetch(`${backendUrl}/api/users/me`, {
        headers: {
          'X-User-Email': testEmail,
        },
      });

      console.log(`Response status: ${response.status}`);

      const responseText = await response.text();
      console.log(`Response body: ${responseText}`);

      if (response.ok) {
        try {
          const userData = JSON.parse(responseText);
          console.log(`✅ Users/me endpoint successful. User data:`);
          console.log(JSON.stringify(userData, null, 2));
        } catch (parseError) {
          console.error(`❌ Failed to parse response as JSON: ${responseText}`);
        }
      } else {
        console.error(
          `❌ Users/me endpoint returned status ${response.status}: ${responseText}`
        );
      }
    } catch (error) {
      console.error(`❌ Users/me endpoint error: ${error.message}`);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testMeEndpoint();
