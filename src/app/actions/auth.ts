"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createProfile, getProfileByEmail } from "@/lib/store";
import { setSession, clearSession } from "@/lib/session";

export interface ActionState {
  error?: string;
}

const baseSchema = z.object({
  role: z.enum(["resident", "agent", "researcher"]),
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  neighborhood: z.string().trim().min(2, "Tell us your neighborhood."),
  address: z.string().trim().optional().or(z.literal("")),
  licenseNumber: z.string().trim().optional().or(z.literal("")),
  businessPhone: z.string().trim().optional().or(z.literal("")),
  captcha: z.string().optional(),
});

// Agents must provide license + business phone to "Claim Your Profile".
const registerSchema = baseSchema.superRefine((val, ctx) => {
  if (val.role === "agent") {
    if (!val.licenseNumber)
      ctx.addIssue({
        code: "custom",
        path: ["licenseNumber"],
        message: "License number is required to claim an agent profile.",
      });
    if (!val.businessPhone)
      ctx.addIssue({
        code: "custom",
        path: ["businessPhone"],
        message: "Business phone is required to claim an agent profile.",
      });
  }
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }
  const data = parsed.data;

  // Placeholder for the captcha check shown in the onboarding design.
  // Wire this to hCaptcha/Turnstile server-side verification before launch.
  if (data.captcha !== "verified") {
    return { error: "Please confirm the captcha to continue." };
  }

  if (getProfileByEmail(data.email)) {
    return { error: "An account with that email already exists. Sign in instead." };
  }

  const profile = createProfile({
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    neighborhood: data.neighborhood,
    address: data.address || null,
    licenseNumber: data.licenseNumber || null,
    businessPhone: data.businessPhone || null,
  });

  await setSession(profile.id);
  redirect("/app");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  // Mock auth: match by email only. Real Supabase Auth verifies the password.
  const profile = getProfileByEmail(parsed.data.email);
  if (!profile) {
    return { error: "No account found for that email. Create your hub first." };
  }

  await setSession(profile.id);
  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
