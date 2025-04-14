import { type NextRequest, NextResponse } from 'next/server';

// This is a simple mock authentication for demonstration
// In a real app, you would use a proper auth solution
const getCurrentUserId = async (req: NextRequest) => {
  // In a real app, you would verify a token from cookies/headers
  // For now, we'll just return a mock user ID
  return 'mockUserId123';
};

export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    const { profileImage } = await req.json();

    // Send updated image to your backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/${userId}/image`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileImage }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile image');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json(
      { error: 'Failed to update profile image' },
      { status: 500 }
    );
  }
}
