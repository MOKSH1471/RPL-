import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TivKrz1oOVPG55',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'TE0Ex76uPfAIQI51jtt7x301',
});

export default razorpay;
