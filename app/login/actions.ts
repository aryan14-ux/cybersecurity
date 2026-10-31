"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Authentication failed. Please try again." };
      }
    }
    // In Next.js, redirect() throws a special NEXT_REDIRECT error which MUST be rethrown!
    throw error;
  }
}
