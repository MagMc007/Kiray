import { z } from "zod";

export const syncSchema = z.object({
  role: z.enum(["renter", "rentee"], {
    required_error: "Role is required",
    invalid_enum_value: "Role must be either renter or rentee",
  }),
});
