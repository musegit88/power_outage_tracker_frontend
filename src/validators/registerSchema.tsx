import z from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(24, "Password must be at most 24 characters"),
  phoneNumber: z.string(),
  userName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(24, "Name must be at most 24 characters"),
  consents: z
    .array(
      z.object({
        consentType: z.enum(["PRIVACY_POLICY", "TERMS_AND_CONDITIONS"]),
        accepted: z.boolean(),
      }),
    )
    .refine((value) => value.every((consent) => consent.accepted), {
      message: "You must accept the Privacy Policy and Terms of Service",
    }),
});
