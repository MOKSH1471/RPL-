import { z } from 'zod';

export const registrationSchema = z.object({
  // Gmail Config
  recipientGmail: z.string().email().optional().or(z.literal('')),
  ccEmail: z.string().email().optional().or(z.literal('')),

  // Personal Info
  fullName: z
    .string()
    .min(2, { message: 'Full Name must be at least 2 characters' })
    .max(60, { message: 'Full Name is too long' }),
  mobileNumber: z
    .string()
    .min(10, { message: 'Mobile number must be at least 10 digits' })
    .regex(/^[0-9+\s-]{10,15}$/, { message: 'Invalid mobile number format' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid Email ID' }),
  dateOfBirth: z
    .string()
    .min(1, { message: 'Please select Date of Birth (dd-mm-yyyy)' }),
  centre: z
    .string()
    .min(1, { message: 'Please select your Centre' }),

  // RPL Specifics
  existingRplFamily: z.enum(['Yes', 'No'], {
    required_error: 'Please select if existing RPL Family',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select Gender',
  }),
  tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], {
    required_error: 'Please select T-Shirt Size',
  }),
  foodPreference: z.enum(['Jain', 'Swaminarayan', 'Regular Veg', 'Special Diet'], {
    required_error: 'Please select Food Preference',
  }),
  accommodationRequired: z.enum(['Yes', 'No'], {
    required_error: 'Please select Accommodation Preference',
  }),

  // League Context
  league: z.enum(['cricket', 'football', 'womens'], {
    required_error: 'Please select a league',
  }),
  cricketRole: z.enum(['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper']).optional(),
  battingStyle: z.string().optional(),
  footballPosition: z.enum(['Forward', 'Midfielder', 'Defender', 'Goalkeeper']).optional(),
  womensCategory: z.enum(["Women's Cricket", "Women's Football", 'Throwball']).optional(),
  preferredTeamName: z.string().optional(),
});

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;
