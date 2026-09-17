import { z } from 'zod';

/**
 * Normalizes phone numbers entered or pasted:
 * - Strips all non-digit characters.
 * - If country code is India (+91) and number has 12 digits starting with '91', strips '91'.
 * - If country code is India (+91) and number has 11 digits starting with '0', strips '0'.
 * - If country code is USA (+1) and number has 11 digits starting with '1', strips '1'.
 * - If still more than 10 digits, takes the last 10 digits (to preserve subscriber number over prefixes).
 * - Slices to max 10 digits.
 */
export function cleanPhoneNumber(input: string, countryCode: string = '+91'): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  if (!digits) return '';

  const isIndia = !countryCode || countryCode === '+91';
  const isUsa = countryCode === '+1';

  if (isIndia) {
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
  } else if (isUsa) {
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }
  }

  // If user pasted/typed a string with extra leading digits, keep the last 10 digits
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return digits;
}

export const registrationSchema = z
  .object({
    // Gmail Config
    recipientGmail: z.string().email().optional().or(z.literal('')),
    ccEmail: z.string().email().optional().or(z.literal('')),

    // Basic / Common Questions (Required for everyone)
    fullName: z
      .string()
      .min(2, { message: 'Full Name must be at least 2 characters' })
      .max(60, { message: 'Full Name is too long' }),
    countryCode: z.string().optional(),
    mobileNumber: z
      .string()
      .min(10, { message: 'Mobile number must be strictly 10 digits' })
      .max(10, { message: 'Mobile number must be strictly 10 digits' })
      .regex(/^\d{10}$/, { message: 'Mobile number must be strictly 10 digits' })
      .refine((val) => !/^(\d)\1{9}$/.test(val), {
        message: 'Repeated dummy numbers (like 0000000000, 1111111111) are not allowed',
      })
      .refine((val) => !val.startsWith('0'), {
        message: 'Mobile number cannot start with 0 (card numbers are not valid mobile numbers)',
      }),

    email: z
      .string()
      .email({ message: 'Please enter a valid Email ID' }),
    centre: z
      .string()
      .min(1, { message: 'Please select your Centre Name' }),
    tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], {
      required_error: 'Please select your Jersey / T-Shirt Size',
    }),
    dateOfBirth: z
      .string()
      .min(1, { message: 'Please select Date of Birth' }),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Please select Gender',
    }),
    foodPreference: z.string().min(1, {
      message: 'Please select Food Preference (Spice Level)',
    }),
    accommodationRequired: z.enum(['Yes', 'No'], {
      required_error: 'Please select Accommodation Requirement',
    }),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    existingRplFamily: z.enum(['Yes', 'No'], {
      required_error: 'Please select if you are existing RPL Family',
    }),

    // Multi-Sport Selection
    selectedSports: z
      .array(z.string())
      .min(1, { message: 'Please select at least one Sport to register in' }),
    league: z.string().optional(),

    // Dynamic Cricket Specifics
    cricketRole: z.string().optional(),
    battingStyle: z.string().optional(),
    bowlingStyle: z.string().optional(),
    cricketExperience: z.string().optional(),

    // Dynamic Football Specifics
    footballPosition: z.string().optional(),
    preferredFoot: z.string().optional(),
    footballExperience: z.string().optional(),

    // Dynamic Badminton Specifics
    badmintonCategory: z.string().optional(),
    badmintonHand: z.string().optional(),
    badmintonExperience: z.string().optional(),

    // Dynamic Table Tennis Specifics
    ttCategory: z.string().optional(),
    ttGrip: z.string().optional(),
    ttExperience: z.string().optional(),

    // Dynamic Pickleball Specifics
    pickleballCategory: z.string().optional(),
    pickleballSkill: z.string().optional(),
    pickleballPartner: z.string().optional(),
    pickleballExperience: z.string().optional(),

    // Dynamic Volleyball / Throwball Specifics
    volleyballRole: z.string().optional(),
    volleyballExperience: z.string().optional(),

    // Dynamic Women's League Specifics
    womensCategory: z.string().optional(),
    womensPlayingRole: z.string().optional(),
    womensExperience: z.string().optional(),

    // Optional Customizations
    customJerseyName: z.string().optional(),
    preferredJerseyNumber: z.string().optional(),
    preferredTeamName: z.string().optional(),
    additionalNotes: z.string().optional(),

    // Ashram Member Reference
    referrerCountryCode: z.string().optional(),
    referrerMobile: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{10}$/.test(val), {
        message: 'Referrer mobile number must be strictly 10 digits',
      })
      .refine((val) => !val || !/^(\d)\1{9}$/.test(val), {
        message: 'Referrer mobile number cannot be repeated dummy digits',
      })
      .refine((val) => !val || !val.startsWith('0'), {
        message: 'Referrer mobile number cannot start with 0',
      }),
    referrerName: z.string().optional(),
    referrerCardNo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isIndia = !data.countryCode || data.countryCode === '+91';
    const isUsa = data.countryCode === '+1';

    if (data.mobileNumber && data.mobileNumber.length === 10) {
      if (isIndia && !/^[6-9]\d{9}$/.test(data.mobileNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['mobileNumber'],
          message: 'Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9',
        });
      } else if (isUsa && !/^[2-9]\d{9}$/.test(data.mobileNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['mobileNumber'],
          message: 'USA/Canada phone numbers must be 10 digits starting with 2–9',
        });
      }
    }

    if (data.referrerMobile && data.referrerMobile.length === 10) {
      const isRefIndia = !data.referrerCountryCode || data.referrerCountryCode === '+91';
      const isRefUsa = data.referrerCountryCode === '+1';

      if (isRefIndia && !/^[6-9]\d{9}$/.test(data.referrerMobile)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['referrerMobile'],
          message: 'Referrer Indian mobile number must be 10 digits starting with 6, 7, 8, or 9',
        });
      } else if (isRefUsa && !/^[2-9]\d{9}$/.test(data.referrerMobile)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['referrerMobile'],
          message: 'Referrer USA phone number must be 10 digits starting with 2–9',
        });
      }
    }
  });

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;
