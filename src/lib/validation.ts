import { z } from 'zod';

export const registrationSchema = z.object({
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
    .min(7, { message: 'Please enter a valid mobile number' })
    .regex(/^[0-9+\s-]{7,16}$/, { message: 'Invalid mobile number format' }),

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
  foodPreference: z.enum(['Regular', 'Non-Spicy'], {
    required_error: 'Please select Food Preference (Spice Level)',
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
});

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;


