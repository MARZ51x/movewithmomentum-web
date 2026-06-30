"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase";

export interface ActionState {
  error?: string;
}

const baseSchema = z.object({
  // Public signup may only create buyer/seller ("user") or agent accounts.
  // The "admin" role is assigned server-side (DB / service role) only.
  role: z.enum(["agent", "user"]),
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

  const supabase = await createSupabaseServerClient();

  // Supabase Auth owns email/password. With email confirmations disabled this
  // returns an active session, so the profile insert below runs authenticated
  // as the new user (auth.uid() = id), satisfying the insert policy.
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (signUpError || !signUp.user) {
    return {
      error:
        signUpError?.message ??
        "We couldn't create your account. Please try again.",
    };
  }

  // Insert the domain profile row. The `lock_profile_privileged_columns`
  // trigger forces is_verified_agent = false and pins email to the JWT, so
  // agent verification is now a separate admin/service-role step.
  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUp.user.id,
    full_name: data.fullName,
    email: data.email,
    role: data.role,
    neighborhood: data.neighborhood,
    address: data.address || null,
    license_number: data.licenseNumber || null,
    business_phone: data.businessPhone || null,
  });

  if (profileError) {
    // Roll back the orphaned auth user so the email can be reused.
    try {
      const admin = createSupabaseServiceClient();
      await admin.auth.admin.deleteUser(signUp.user.id);
    } catch {
      // Best-effort cleanup; surface the original failure regardless.
    }
    return {
      error: "We couldn't finish setting up your profile. Please try again.",
    };
  }

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/app");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
