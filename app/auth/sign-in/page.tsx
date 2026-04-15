import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return <AuthForm mode="sign-in" />;
}
