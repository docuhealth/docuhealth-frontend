import { describe, expect, it } from "vitest";
import {
  accountDetailsSchema,
  facilityDocumentsSchema,
  hospitalDetailsSchema,
  patientLoginSchema,
  resetPasswordSchema,
  staffLoginSchema,
} from "@/features/auth/lib/schemas";

const validAddress = {
  country: "Nigeria",
  state: "Lagos",
  city: "Ikeja",
  street: "12 Allen Avenue",
};

describe("auth form schemas", () => {
  it("accepts email, phone, or HIN on patient login and rejects invalid identifiers", () => {
    expect(
      patientLoginSchema.safeParse({ identifier: "ada@example.com", password: "secret" }).success,
    ).toBe(true);
    expect(
      patientLoginSchema.safeParse({ identifier: "+2348012345678", password: "secret" }).success,
    ).toBe(true);
    expect(
      patientLoginSchema.safeParse({ identifier: "1234567890123", password: "secret" }).success,
    ).toBe(true);
    expect(
      patientLoginSchema.safeParse({ identifier: "not-valid", password: "secret" }).success,
    ).toBe(false);
  });

  it("accepts email or phone on staff login and rejects HIN or invalid identifiers", () => {
    expect(
      staffLoginSchema.safeParse({ identifier: "admin@luth.com", password: "secret" }).success,
    ).toBe(true);
    expect(
      staffLoginSchema.safeParse({ identifier: "not-an-email", password: "secret" }).success,
    ).toBe(false);
  });

  it("flags mismatched passwords on the confirm field", () => {
    const result = accountDetailsSchema.safeParse({
      nin: "12345678901",
      password: "password123",
      confirmPassword: "password124",
    });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["confirmPassword"], message: "Passwords do not match" }),
    ]);
  });

  it("requires new passwords to be at least 8 characters", () => {
    const result = resetPasswordSchema.safeParse({ password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("accepts an 11-digit NIN with separators and strips them", () => {
    const result = accountDetailsSchema.parse({
      nin: "123-456-789 01",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.nin).toBe("12345678901");
  });

  it("rejects a NIN that isn't 11 digits", () => {
    const result = accountDetailsSchema.safeParse({
      nin: "1234567890",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts up to four PDF/JPG/PNG documents of 5 MB or less with address", () => {
    const pdf = new File(["x"], "licence.pdf", { type: "application/pdf" });
    expect(facilityDocumentsSchema.safeParse({ ...validAddress, files: [pdf] }).success).toBe(true);
    expect(facilityDocumentsSchema.safeParse({ ...validAddress, files: [] }).success).toBe(false);
    expect(
      facilityDocumentsSchema.safeParse({ ...validAddress, files: Array(5).fill(pdf) }).success,
    ).toBe(false);
  });

  it("rejects other file types and files over 5 MB", () => {
    const doc = new File(["x"], "notes.docx", { type: "application/msword" });
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "scan.png", { type: "image/png" });
    const result = facilityDocumentsSchema.safeParse({ ...validAddress, files: [doc, big] });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Use PDF, JPG or PNG files",
      "Each file must be 5 MB or less",
    ]);
  });

  it("accepts CAC RC numbers with or without the RC prefix", () => {
    const details = {
      hospitalName: "Havannah",
      facilityType: "hospital",
      ownership: "private",
    } as const;
    for (const rcNumber of ["RC 1234567", "rc1234567", "1234567"]) {
      expect(hospitalDetailsSchema.safeParse({ ...details, rcNumber }).success).toBe(true);
    }
    expect(hospitalDetailsSchema.safeParse({ ...details, rcNumber: "ABC" }).success).toBe(false);
  });
});
