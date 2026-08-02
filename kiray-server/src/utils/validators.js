import { z } from "zod";

export const syncSchema = z.object({
  role: z.enum(["landlord", "rentee", "admin"], {
    required_error: "Role is required",
    invalid_enum_value: "Role must be one of: landlord, rentee, admin",
  }),
});
