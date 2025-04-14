import { type NextRequest, NextResponse } from 'next/server';

// Get the current user's email from cookies or local storage
const getCurrentUserEmail = async (req: NextRequest) => {
  // Try to get email from cookie
  const email = req.cookies.get('userEmail')?.value;

  if (email) {
    console.log(`Found email in cookie: ${email}`);
    return email;
  }

  // If no email in cookie, return a default for testing
  const defaultEmail = 'alex.johnson@example.com'; // Replace with an email that exists in your database
  console.log(`No email found in cookie, using default: ${defaultEmail}`);
  return defaultEmail;
};

export async function GET(req: NextRequest) {
  try {
    // Get the current user's email
    const userEmail = await getCurrentUserEmail(req);
    console.log(`Attempting to fetch profile for email: ${userEmail}`);

    if (!process.env.BACKEND_URL) {
      console.log('⚠️ BACKEND_URL is not defined. Using mock data.');
      return NextResponse.json({
        name: 'Alex Johnson',
        username: 'alexjohnson',
        email: userEmail,
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        profileImage: '/placeholder.svg?height=96&width=96',
        isVerified: true,
      });
    }

    const backendUrl = `${process.env.BACKEND_URL}/api/users/me`;
    console.log(`🔍 Fetching user data from: ${backendUrl}`);
    console.log(`🔍 Using X-User-Email header: ${userEmail}`);

    try {
      // Fetch user data from your backend using the /me endpoint with email header
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail, // Pass email in header for development
        },
      });

      console.log(`Backend response status: ${response.status}`);
      const responseText = await response.text();
      console.log(`Backend response body: ${responseText}`);

      if (!response.ok) {
        console.error(`❌ Backend returned status: ${response.status}`);
        console.error(`❌ Response body: ${responseText}`);
        throw new Error(
          `Backend returned status: ${response.status} - ${responseText}`
        );
      }

      // Parse the response text as JSON
      let userData;
      try {
        userData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Failed to parse response as JSON: ${responseText}`);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('✅ User data fetched successfully:', userData);
      return NextResponse.json(userData);
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error in profile API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userEmail = await getCurrentUserEmail(req);
    const data = await req.json();

    if (!process.env.BACKEND_URL) {
      console.log(
        '⚠️ BACKEND_URL is not defined. Simulating successful update.'
      );
      return NextResponse.json({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`🔍 Updating user data for email: ${userEmail}`);

    try {
      // Send updated data to your backend
      const response = await fetch(`${process.env.BACKEND_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail, // Pass email in header for development
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Backend returned status: ${response.status}`);
        console.error(`❌ Response body: ${errorText}`);
        throw new Error(
          `Backend returned status: ${response.status} - ${errorText}`
        );
      }

      const updatedData = await response.json();
      console.log('✅ User data updated successfully');
      return NextResponse.json(updatedData);
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error in profile update API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
