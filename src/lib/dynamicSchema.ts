import { z } from 'zod';
import { DynamicField } from '@/types';

export function buildDynamicZodSchema(fields: DynamicField[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    // Core fields always required
    fullName: z
      .string()
      .min(2, { message: 'Full Name must be at least 2 characters' })
      .max(60, { message: 'Full Name is too long' }),
    email: z.string().email({ message: 'Please enter a valid Email ID' }),
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
    countryCode: z.string().optional(),
    selectedSports: z
      .array(z.string())
      .min(1, { message: 'Please select at least one Sport to register in' }),
  };

  // Add dynamic fields
  fields.forEach((field) => {
    const rules = field.validation_rules || {};
    const isRequired = !!rules.required;

    let validator: z.ZodTypeAny;

    if (field.field_type === 'number') {
      let baseNumber = z.number({ invalid_type_error: `${field.label} must be a valid number` });
      if (rules.min !== undefined) {
        baseNumber = baseNumber.min(rules.min, { message: `${field.label} must be at least ${rules.min}` });
      }
      if (rules.max !== undefined) {
        baseNumber = baseNumber.max(rules.max, { message: `${field.label} cannot exceed ${rules.max}` });
      }

      const numVal = z.preprocess((val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      }, baseNumber);

      validator = isRequired
        ? numVal
        : numVal.optional().or(z.literal(''));
    } else if (field.field_type === 'select' && field.options && field.options.length > 0) {
      const optionsArray = field.options as [string, ...string[]];
      const enumVal = z.enum(optionsArray, {
        errorMap: () => ({ message: `Please select an option for ${field.label}` }),
      });

      validator = isRequired
        ? enumVal
        : enumVal.optional().or(z.literal(''));
    } else {
      let strVal = z.string();
      if (isRequired) {
        strVal = strVal.min(1, { message: `${field.label} is required` });
      }
      if (rules.regex) {
        try {
          const reg = new RegExp(rules.regex);
          strVal = strVal.regex(reg, { message: `Invalid format for ${field.label}` });
        } catch {
          // Ignore invalid regex
        }
      }
      validator = isRequired ? strVal : strVal.optional().or(z.literal(''));
    }

    shape[field.field_key] = validator;
  });

  return z.object(shape);
}
