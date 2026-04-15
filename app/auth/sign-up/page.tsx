import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return <AuthForm mode="sign-up" />;
}
