import { NextResponse } from "next/server";

// Simulate a database
let formData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
  },
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  preferences: {
    notifications: false,
    newsletter: false,
    theme: "light",
  },
};

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(formData);
}

export async function POST(request: Request) {
  const data = await request.json();
  console.log(data);
  // If status is completed, reset the form data
  if (data.status === "completed") {
    formData = {
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      preferences: {
        notifications: false,
        newsletter: false,
        theme: "light",
      },
    };
  } else {
    formData = { ...formData, ...data };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(formData);
}
