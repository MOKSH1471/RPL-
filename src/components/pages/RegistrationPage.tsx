import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { registrationSchema, RegistrationSchemaType } from '@/lib/validation';
import { SportType, RegistrationFormData } from '@/types';
import { RegistrationTicket } from '@/components/ui/RegistrationTicket';
import { InView } from '@/components/ui/in-view';
import BasicDropdown, { DropdownItem } from '@/components/ui/accordion-2';
import { OptionSelector } from '@/components/ui/OptionSelector';
import { ModernDatePicker } from '@/components/ui/ModernDatePicker';
import { CountryCodeSelect } from '@/components/ui/CountryCodeSelect';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldCheck,
  Mail,
  Shirt,
  User,
  Phone,
  MapPin,
  Calendar,
  Utensils,
  Home,
  Check,
  Zap,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';

interface RegistrationPageProps {
  initialLeague?: string;
  onBackToHome: () => void;
}

interface SportOption {
  id: SportType;
  name: string;
  category: string;
  emoji: string;
  colorBg: string;
  colorBorder: string;
  colorBadge: string;
}

const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: 'cricket',
    name: 'Cricket Championship',
    category: 'T20 Willow / Leather Ball Arena',
    emoji: '🏏',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-400',
    colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'football',
    name: 'Football Championship',
    category: '7-A-Side Turf Knockouts',
    emoji: '⚽',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-400',
    colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'badminton',
    name: 'Badminton Championship',
    category: 'Singles, Doubles & Mixed Doubles',
    emoji: '🏸',
    colorBg: 'bg-cyan-50',
    colorBorder: 'border-cyan-400',
    colorBadge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis Championship',
    category: 'Fast-Paced Speed & Spin Arena',
    emoji: '🏓',
    colorBg: 'bg-indigo-50',
    colorBorder: 'border-indigo-400',
    colorBadge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    id: 'pickleball',
    name: 'Pickleball Championship',
    category: 'Open Skill Divisions & Doubles',
    emoji: '🎾',
    colorBg: 'bg-orange-50',
    colorBorder: 'border-orange-400',
    colorBadge: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    id: 'volleyball',
    name: 'Volleyball & Throwball',
    category: 'Spikers Arena & Court Action',
    emoji: '🏐',
    colorBg: 'bg-purple-50',
    colorBorder: 'border-purple-400',
    colorBadge: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'womens-sports',
    name: "Women's Multi-Sport League",
    category: "Women's Cricket, Football & Throwball",
    emoji: '🏆',
    colorBg: 'bg-pink-50',
    colorBorder: 'border-pink-400',
    colorBadge: 'bg-pink-100 text-pink-900 border-pink-300',
  },
];

const JERSEY_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  initialLeague = 'cricket',
  onBackToHome,
}) => {
  // Normalize initial sport
  const mapInitialSport = (id: string): SportType => {
    if (id === 'womens') return 'womens-sports';
    if (AVAILABLE_SPORTS.some((s) => s.id === id)) return id as SportType;
    return 'cricket';
  };

  const [selectedSports, setSelectedSports] = useState<SportType[]>([mapInitialSport(initialLeague)]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sportSearch, setSportSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      recipientGmail: 'rpl@vitraagvigyaan.org',
      ccEmail: '',
      fullName: '',
      countryCode: '+91',
      mobileNumber: '',
      email: '',
      centre: 'Mumbai',
      tshirtSize: 'L',
      dateOfBirth: '',
      gender: 'Male',
      foodPreference: 'Jain',
      accommodationRequired: 'No',
      existingRplFamily: 'No',
      selectedSports: [mapInitialSport(initialLeague)],
      // Cricket Defaults
      cricketRole: 'Batter',
      battingStyle: 'Right-hand bat',
      bowlingStyle: 'Right-arm Fast / Medium',
      cricketExperience: 'Intermediate (Club / College)',
      // Football Defaults
      footballPosition: 'Forward / Striker',
      preferredFoot: 'Right foot',
      footballExperience: 'Intermediate (Club / College)',
      // Badminton Defaults
      badmintonCategory: 'Doubles',
      badmintonHand: 'Right-handed',
      badmintonExperience: 'Intermediate (Club / College)',
      // Table Tennis Defaults
      ttCategory: 'Singles',
      ttGrip: 'Shakehand Grip',
      ttExperience: 'Intermediate (Club / College)',
      // Pickleball Defaults
      pickleballCategory: 'Men Doubles',
      pickleballSkill: '3.5 (Intermediate)',
      pickleballPartner: '',
      pickleballExperience: 'Intermediate (Club / College)',
      // Volleyball Defaults
      volleyballRole: 'Spiker / Attacker',
      volleyballExperience: 'Intermediate (Club / College)',
      // Women's Defaults
      womensCategory: "Women's Cricket",
      womensPlayingRole: 'All-rounder',
      womensExperience: 'Intermediate (Club / College)',
      // Customizations
      customJerseyName: '',
      preferredJerseyNumber: '',
      preferredTeamName: '',
      additionalNotes: '',
    },
  });

  const currentTshirtSize = watch('tshirtSize');
  const currentGender = watch('gender');
  const currentAcc = watch('accommodationRequired');
  const currentExistingFamily = watch('existingRplFamily');
  const currentCentre = watch('centre');
  const currentFood = watch('foodPreference');
  const currentFullName = watch('fullName');
  const currentCountryCode = watch('countryCode') || '+91';
  const currentMobile = watch('mobileNumber');
  const currentEmail = watch('email');
  const currentDateOfBirth = watch('dateOfBirth');


  // Sport dynamic watches
  const currentCricketRole = watch('cricketRole');
  const currentBattingStyle = watch('battingStyle');
  const currentBowlingStyle = watch('bowlingStyle');
  const currentCricketExp = watch('cricketExperience');
  const currentFootballPos = watch('footballPosition');
  const currentFootballFoot = watch('preferredFoot');
  const currentFootballExp = watch('footballExperience');
  const currentBadmintonCat = watch('badmintonCategory');
  const currentBadmintonHand = watch('badmintonHand');
  const currentBadmintonExp = watch('badmintonExperience');
  const currentTtCat = watch('ttCategory');
  const currentTtGrip = watch('ttGrip');
  const currentTtExp = watch('ttExperience');
  const currentPickleballCat = watch('pickleballCategory');
  const currentPickleballSkill = watch('pickleballSkill');
  const currentVolleyballRole = watch('volleyballRole');
  const currentVolleyballExp = watch('volleyballExperience');
  const currentWomensCat = watch('womensCategory');
  const currentWomensExp = watch('womensExperience');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Calculate completion percentage accurately
  const calculateProgress = () => {
    let fieldsCount = 0;
    let filledCount = 0;

    // 1. Full name
    fieldsCount++;
    if (currentFullName && currentFullName.trim().length >= 2) filledCount++;

    // 2. Mobile number
    fieldsCount++;
    if (currentMobile && currentMobile.trim().length >= 7) filledCount++;

    // 3. Email
    fieldsCount++;
    if (currentEmail && currentEmail.includes('@')) filledCount++;

    // 4. Date of birth
    fieldsCount++;
    if (currentDateOfBirth && currentDateOfBirth.trim().length > 0) filledCount++;

    // 5. Jersey size
    fieldsCount++;
    if (currentTshirtSize) filledCount++;

    // 6. Selected sports
    fieldsCount++;
    if (selectedSports && selectedSports.length > 0) filledCount++;

    // 7. Centre
    fieldsCount++;
    if (currentCentre) filledCount++;

    return Math.round((filledCount / fieldsCount) * 100);
  };

  const progress = calculateProgress();


  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSportSelection = (sportId: SportType) => {
    let updated: SportType[];
    if (selectedSports.includes(sportId)) {
      if (selectedSports.length === 1) {
        return;
      }
      updated = selectedSports.filter((s) => s !== sportId);
    } else {
      updated = [...selectedSports, sportId];
    }
    setSelectedSports(updated);
    setValue('selectedSports', updated, { shouldValidate: true });
  };

  const handleRemoveSport = (sportId: SportType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedSports.length <= 1) return;
    const updated = selectedSports.filter((s) => s !== sportId);
    setSelectedSports(updated);
    setValue('selectedSports', updated, { shouldValidate: true });
  };

  const handleSelectAllSports = () => {
    const all = AVAILABLE_SPORTS.map((s) => s.id);
    setSelectedSports(all);
    setValue('selectedSports', all, { shouldValidate: true });
  };

  const handleClearSports = () => {
    const first = [AVAILABLE_SPORTS[0].id];
    setSelectedSports(first);
    setValue('selectedSports', first, { shouldValidate: true });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName('');
  };

  const onSubmit = async (data: RegistrationSchemaType) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const generatedId = `RPL9-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullData: RegistrationFormData = {
      recipientGmail: data.recipientGmail || 'rpl@vitraagvigyaan.org',
      ccEmail: data.ccEmail,
      fullName: data.fullName,
      countryCode: data.countryCode || '+91',
      mobileNumber: data.mobileNumber,
      email: data.email,
      centre: data.centre,
      tshirtSize: data.tshirtSize,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      foodPreference: data.foodPreference,
      accommodationRequired: data.accommodationRequired,
      existingRplFamily: data.existingRplFamily,
      photoName: photoName || undefined,
      photoDataUrl: photoPreview || undefined,
      selectedSports: selectedSports,
      primarySport: selectedSports[0],
      league: (selectedSports[0] === 'womens-sports' ? 'womens' : selectedSports[0]) as any,
      // Dynamic details
      cricketRole: selectedSports.includes('cricket') ? (data.cricketRole as any) : undefined,
      battingStyle: selectedSports.includes('cricket') ? data.battingStyle : undefined,
      bowlingStyle: selectedSports.includes('cricket') ? data.bowlingStyle : undefined,
      cricketExperience: selectedSports.includes('cricket') ? data.cricketExperience : undefined,
      footballPosition: selectedSports.includes('football') ? data.footballPosition : undefined,
      preferredFoot: selectedSports.includes('football') ? data.preferredFoot : undefined,
      footballExperience: selectedSports.includes('football') ? data.footballExperience : undefined,
      badmintonCategory: selectedSports.includes('badminton') ? (data.badmintonCategory as any) : undefined,
      badmintonHand: selectedSports.includes('badminton') ? (data.badmintonHand as any) : undefined,
      badmintonExperience: selectedSports.includes('badminton') ? data.badmintonExperience : undefined,
      ttCategory: selectedSports.includes('table-tennis') ? (data.ttCategory as any) : undefined,
      ttGrip: selectedSports.includes('table-tennis') ? (data.ttGrip as any) : undefined,
      ttExperience: selectedSports.includes('table-tennis') ? data.ttExperience : undefined,
      pickleballCategory: selectedSports.includes('pickleball') ? (data.pickleballCategory as any) : undefined,
      pickleballSkill: selectedSports.includes('pickleball') ? (data.pickleballSkill as any) : undefined,
      pickleballPartner: selectedSports.includes('pickleball') ? data.pickleballPartner : undefined,
      pickleballExperience: selectedSports.includes('pickleball') ? data.pickleballExperience : undefined,
      volleyballRole: selectedSports.includes('volleyball') ? (data.volleyballRole as any) : undefined,
      volleyballExperience: selectedSports.includes('volleyball') ? data.volleyballExperience : undefined,
      womensCategory: selectedSports.includes('womens-sports') ? data.womensCategory : undefined,
      womensPlayingRole: selectedSports.includes('womens-sports') ? data.womensPlayingRole : undefined,
      womensExperience: selectedSports.includes('womens-sports') ? data.womensExperience : undefined,
      customJerseyName: data.customJerseyName,
      preferredJerseyNumber: data.preferredJerseyNumber,
      preferredTeamName: data.preferredTeamName,
      additionalNotes: data.additionalNotes,
    };

    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('rpl_registrations') || '[]');
      localStorage.setItem('rpl_registrations', JSON.stringify([...existing, { id: generatedId, ...fullData }]));
    } catch {
      // LocalStorage fallback
    }

    // Prepare Gmail body
    const sportsFormatted = selectedSports
      .map((s) => {
        const info = AVAILABLE_SPORTS.find((item) => item.id === s);
        return info ? `${info.emoji} ${info.name}` : s;
      })
      .join(', ');

    const targetEmail = data.recipientGmail || 'rpl@vitraagvigyaan.org';
    const cc = data.ccEmail ? `&cc=${encodeURIComponent(data.ccEmail)}` : '';
    const subject = encodeURIComponent(`[RPL Season 9 Registration] ${data.fullName} - ${selectedSports.join(', ').toUpperCase()}`);

    const sportSpecificSummaries: string[] = [];
    if (selectedSports.includes('cricket')) {
      sportSpecificSummaries.push(`[CRICKET] Role: ${data.cricketRole} | Batting: ${data.battingStyle || 'Right-hand'} | Bowling: ${data.bowlingStyle || 'N/A'} | Experience: ${data.cricketExperience || 'N/A'}`);
    }
    if (selectedSports.includes('football')) {
      sportSpecificSummaries.push(`[FOOTBALL] Position: ${data.footballPosition} | Foot: ${data.preferredFoot || 'Right foot'} | Experience: ${data.footballExperience || 'N/A'}`);
    }
    if (selectedSports.includes('badminton')) {
      sportSpecificSummaries.push(`[BADMINTON] Category: ${data.badmintonCategory} | Hand: ${data.badmintonHand || 'Right-handed'} | Experience: ${data.badmintonExperience || 'N/A'}`);
    }
    if (selectedSports.includes('table-tennis')) {
      sportSpecificSummaries.push(`[TABLE TENNIS] Category: ${data.ttCategory} | Grip: ${data.ttGrip || 'Shakehand'} | Experience: ${data.ttExperience || 'N/A'}`);
    }
    if (selectedSports.includes('pickleball')) {
      sportSpecificSummaries.push(`[PICKLEBALL] Category: ${data.pickleballCategory} | Skill: ${data.pickleballSkill} | Partner: ${data.pickleballPartner || 'None'} | Experience: ${data.pickleballExperience || 'N/A'}`);
    }
    if (selectedSports.includes('volleyball')) {
      sportSpecificSummaries.push(`[VOLLEYBALL / THROWBALL] Role: ${data.volleyballRole} | Experience: ${data.volleyballExperience || 'N/A'}`);
    }
    if (selectedSports.includes('womens-sports')) {
      sportSpecificSummaries.push(`[WOMEN'S LEAGUE] Category: ${data.womensCategory} | Role: ${data.womensPlayingRole || 'All-Rounder'} | Experience: ${data.womensExperience || 'N/A'}`);
    }

    const emailBodyText = `
RAJ PREMIER LEAGUE (RPL SEASON 9) - OFFICIAL REGISTRATION
======================================================
Registration ID: ${generatedId}
Date of Registration: ${new Date().toLocaleString()}

1. COMMON PARTICIPANT DETAILS:
------------------------------------------------------
Full Name: ${data.fullName}
Mobile Number: ${data.countryCode || '+91'} ${data.mobileNumber}

Email Address: ${data.email}
Centre: ${data.centre}
Jersey / T-Shirt Size: ${data.tshirtSize}
Date of Birth: ${data.dateOfBirth}
Gender: ${data.gender}
Food Preference: ${data.foodPreference}
Accommodation Required: ${data.accommodationRequired}
Existing RPL Family: ${data.existingRplFamily}

2. SELECTED SPORTS:
------------------------------------------------------
Registered Sports: ${sportsFormatted}

3. SPORT-SPECIFIC QUESTIONNAIRE DETAILS:
------------------------------------------------------
${sportSpecificSummaries.join('\n')}

4. APPAREL & TEAM CUSTOMIZATION:
------------------------------------------------------
Custom Jersey Name: ${data.customJerseyName || data.fullName}
Preferred Jersey Number: ${data.preferredJerseyNumber || 'N/A'}
Preferred Team Name: ${data.preferredTeamName || 'N/A'}
Additional Notes: ${data.additionalNotes || 'None'}
======================================================
Submitted via Vitraag Vigyaan RPL Portal
    `.trim();

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}${cc}&su=${subject}&body=${encodeURIComponent(emailBodyText)}`;

    try {
      window.open(gmailComposeUrl, '_blank');
    } catch {
      // Fallback
    }

    setIsSubmitting(false);
    setRegistrationId(generatedId);
    setSubmittedData(fullData);

    try {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#3B82F6'],
      });
    } catch {
      // Fallback
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setRegistrationId('');
    setPhotoPreview(null);
    setPhotoName('');
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSports = AVAILABLE_SPORTS.filter(
    (s) =>
      s.name.toLowerCase().includes(sportSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(sportSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-28 safe-bottom pt-20 sm:pt-28 md:pt-32 px-3 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb Bar with InView entrance */}
        <InView
          viewOptions={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-sm"
        >
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white hover:border-amber-500 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all active:scale-95 touch-manipulation cursor-pointer group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Season 9 Official Portal</span>
          </span>
        </InView>

        {/* Page Hero Header with InView */}
        <InView
          viewOptions={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500 block mb-2">
            PLAYER REGISTRATION
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Official Championship <span className="text-gradient-vibrant">Entry</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base font-medium mb-6">
            Complete your general details first, then select your sports from the multi-choice dropdown to customize positions.
          </p>

          {/* Sleek Milestone Progress Track */}
          <div className="max-w-md mx-auto px-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center space-x-1.5 text-slate-900 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Form Progress</span>
              </span>
              <span className="font-mono text-amber-700 font-extrabold text-xs">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200/90 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 shadow-xs"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        </InView>


        {/* Display Confirmation Ticket if submitted */}
        {submittedData ? (
          <RegistrationTicket
            data={submittedData}
            registrationId={registrationId}
            onReset={handleReset}
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ========================================================================= */}
            {/* SECTION 1: BASIC / COMMON QUESTIONS (COMMON IN EVERY SPORT) */}
            {/* ========================================================================= */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-md space-y-6 sm:space-y-8"
            >
              <div className="flex items-start space-x-3 border-b border-slate-100 pb-4 sm:pb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md shadow-amber-500/20 shrink-0 aspect-square mt-0.5">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg sm:text-2xl font-extrabold text-slate-900">
                    Basic Participant Details
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Standard details common to all sports & championships
                  </p>
                </div>
              </div>



              {/* Full Name & Mobile Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>Full Name</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Mobile Number</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <div className="flex items-stretch rounded-2xl bg-slate-50 border border-slate-300 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-200 focus-within:bg-white transition-all overflow-visible relative min-h-[48px]">
                    <CountryCodeSelect
                      value={currentCountryCode}
                      onChange={(code) => setValue('countryCode', code, { shouldValidate: true })}
                    />
                    <div className="w-[1px] bg-slate-300 my-2.5 shrink-0" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="Enter phone number"
                      {...register('mobileNumber')}
                      className="w-full px-4 py-3.5 bg-transparent border-0 text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium flex-1 min-w-0"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.mobileNumber.message}</span>
                    </p>
                  )}
                </div>


              </div>


              {/* Email & Centre Name (with BasicDropdown) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span>Email Address</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="your.email@example.com"
                    {...register('email')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    <span>Centre Name</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <BasicDropdown
                    label="Select Centre"
                    items={[
                      { id: 'Mumbai', label: 'Mumbai' },
                      { id: 'Surat', label: 'Surat' },
                      { id: 'Ahmedabad', label: 'Ahmedabad' },
                      { id: 'London', label: 'London (UK)' },
                      { id: 'USA / Canada', label: 'USA / Canada' },
                      { id: 'Other', label: 'Other Centre' },
                    ]}
                    value={currentCentre ? { id: currentCentre, label: currentCentre } : null}
                    onChange={(item) => setValue('centre', String(item.id), { shouldValidate: true })}
                  />
                  {errors.centre && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.centre.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Jersey / T-Shirt Size Selector */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <span className="flex items-center space-x-1.5">
                    <Shirt className="w-3.5 h-3.5 text-slate-600" />
                    <span>Jersey / T-Shirt Size</span>
                    <span className="text-pink-600">*</span>
                  </span>
                  <span className="text-slate-500 font-semibold text-[11px] normal-case">
                    Selected: <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{currentTshirtSize}</strong>
                  </span>
                </label>
                <OptionSelector
                  options={JERSEY_SIZES}
                  value={currentTshirtSize}
                  onChange={(size) => setValue('tshirtSize', size, { shouldValidate: true })}
                  layoutId="tshirt-size-indicator"
                  gridCols="grid-cols-4 sm:grid-cols-7"
                  activeColor="bg-slate-900"
                  activeTextColor="text-amber-300"
                />
                {errors.tshirtSize && (
                  <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.tshirtSize.message}</span>
                  </p>
                )}
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>Date of Birth</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <ModernDatePicker
                    value={currentDateOfBirth}
                    onChange={(val) => setValue('dateOfBirth', val, { shouldValidate: true })}
                    error={errors.dateOfBirth?.message}
                    placeholder="Select Date of Birth"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.dateOfBirth.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>Gender</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <OptionSelector
                    options={['Male', 'Female', 'Other']}
                    value={currentGender}
                    onChange={(genderOption) => setValue('gender', genderOption as any, { shouldValidate: true })}
                    layoutId="gender-indicator"
                    activeColor="bg-gradient-to-r from-amber-500 to-orange-600"
                    activeTextColor="text-white"
                  />
                </div>
              </div>


              {/* Food Preference (with BasicDropdown) & Accommodation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Utensils className="w-3.5 h-3.5 text-slate-600" />
                    <span>Food Preference</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <BasicDropdown
                    label="Select Food Preference"
                    items={[
                      { id: 'Jain', label: 'Jain' },
                      { id: 'Swaminarayan', label: 'Swaminarayan' },
                      { id: 'Regular Veg', label: 'Regular Veg' },
                      { id: 'Special Diet', label: 'Special Diet' },
                    ]}
                    value={currentFood ? { id: currentFood, label: currentFood } : null}
                    onChange={(item) => setValue('foodPreference', item.id as any, { shouldValidate: true })}
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Home className="w-3.5 h-3.5 text-slate-600" />
                    <span>Accommodation Required</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <OptionSelector
                    options={[
                      { value: 'No', label: 'No, Self-Arranged' },
                      { value: 'Yes', label: 'Yes, Needed' },
                    ]}
                    value={currentAcc}
                    onChange={(accOption) => setValue('accommodationRequired', accOption as any, { shouldValidate: true })}
                    layoutId="accommodation-indicator"
                    activeColor="bg-slate-900"
                    activeTextColor="text-white"
                  />
                </div>
              </div>

              {/* RPL Family & Photo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Existing RPL Family</span>
                    <span className="text-pink-600">*</span>
                  </label>
                  <OptionSelector
                    options={[
                      { value: 'No', label: 'New Player' },
                      { value: 'Yes', label: 'Yes, Previous Season' },
                    ]}
                    value={currentExistingFamily}
                    onChange={(opt) => setValue('existingRplFamily', opt as any, { shouldValidate: true })}
                    layoutId="rpl-family-indicator"
                    activeColor="bg-slate-900"
                    activeTextColor="text-white"
                  />
                </div>


                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Profile Photo (Passport / ID)</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-amber-600 rounded-2xl p-4 text-center transition-all bg-slate-50 hover:bg-white min-h-[100px] flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {photoPreview ? (
                      <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-800 shadow-sm"
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-900 block truncate max-w-[150px]">
                              {photoName}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">Photo Attached</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto();
                          }}
                          className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2 py-1 bg-pink-50 rounded-lg border border-pink-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-800 font-bold">Click to upload photo</p>
                        <span className="text-[10px] text-slate-400 block">JPG, PNG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </InView>

            {/* ========================================================================= */}
            {/* SECTION 2: MULTI-CHOICE SPORT DROPDOWN (7 OPTIONS) */}
            {/* ========================================================================= */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-md space-y-6"
            >
              <div className="flex items-start space-x-3 border-b border-slate-100 pb-4 sm:pb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md shadow-amber-500/20 shrink-0 aspect-square mt-0.5">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg sm:text-2xl font-extrabold text-slate-900">
                    Select Sports (Multi-Choice Dropdown)
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Choose one or more sports you want to participate in. Questions for each chosen sport will appear below.
                  </p>
                </div>
              </div>


              {/* Multi-Select Dropdown Container */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Championship Sports ({selectedSports.length} of {AVAILABLE_SPORTS.length} selected) <span className="text-pink-600">*</span>
                </label>

                {/* Dropdown Trigger Box */}
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full min-h-[56px] p-3 rounded-2xl bg-slate-50 border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    dropdownOpen
                      ? 'border-amber-600 ring-2 ring-amber-200 bg-white'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {selectedSports.map((sportId) => {
                      const sport = AVAILABLE_SPORTS.find((s) => s.id === sportId);
                      if (!sport) return null;
                      return (
                        <span
                          key={sport.id}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-amber-400/40 text-xs font-extrabold shadow-xs"
                        >
                          <span>{sport.emoji}</span>
                          <span>{sport.name}</span>
                          {selectedSports.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveSport(sport.id, e)}
                              className="ml-1 hover:text-white/80 p-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>


                  <div className="flex items-center space-x-2 text-slate-500 shrink-0">
                    <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-1 rounded-lg">
                      {selectedSports.length} selected
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-600 transition-transform ${
                        dropdownOpen ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Dropdown Popover Menu with AnimatePresence */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3"
                    >
                      {/* Search & Actions Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search sports..."
                            value={sportSearch}
                            onChange={(e) => setSportSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSelectAllSports}
                          className="px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSports}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Sports Checkbox List */}
                      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                        {filteredSports.map((sport) => {
                          const isChecked = selectedSports.includes(sport.id);
                          return (
                            <div
                              key={sport.id}
                              onClick={() => toggleSportSelection(sport.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isChecked
                                  ? `${sport.colorBg} ${sport.colorBorder} shadow-xs`
                                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{sport.emoji}</span>
                                <div>
                                  <span className="font-extrabold text-sm text-slate-900 block">
                                    {sport.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {sport.category}
                                  </span>
                                </div>
                              </div>

                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? 'bg-slate-900 border-slate-900 text-amber-300'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-4 h-4" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                {errors.selectedSports && (
                  <p className="mt-2 text-xs text-pink-600 flex items-center space-x-1 font-semibold animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.selectedSports.message}</span>
                  </p>
                )}
              </div>
            </InView>

            {/* ========================================================================= */}
            {/* SECTION 3: DYNAMIC SPORT-SPECIFIC QUESTIONS (FOR EACH SELECTED SPORT) */}
            {/* ========================================================================= */}
            <div className="space-y-6">
              {/* Cricket Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('cricket') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-50/90 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏏</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Cricket Championship Questions
                          </h3>
                          <p className="text-amber-800 text-xs font-semibold">
                            Custom role, batting style, bowling variation & experience
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Primary Playing Role <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Role"
                          items={[
                            { id: 'Batter', label: 'Batter (Top / Middle Order)' },
                            { id: 'Bowler', label: 'Bowler (Fast / Swing / Spin)' },
                            { id: 'All-rounder', label: 'All-rounder (Bat & Bowl)' },
                            { id: 'Wicketkeeper', label: 'Wicketkeeper Batter' },
                          ]}
                          value={currentCricketRole ? { id: currentCricketRole, label: currentCricketRole } : null}
                          onChange={(item) => setValue('cricketRole', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Batting Hand / Style <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Batting Style"
                          items={[
                            { id: 'Right-hand bat', label: 'Right-Handed Batter (RHB)' },
                            { id: 'Left-hand bat', label: 'Left-Handed Batter (LHB)' },
                          ]}
                          value={currentBattingStyle ? { id: currentBattingStyle, label: currentBattingStyle } : null}
                          onChange={(item) => setValue('battingStyle', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Bowling Variation / Style <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Bowling Style"
                          items={[
                            { id: 'Right-arm Fast / Medium', label: 'Right-Arm Fast / Pace / Medium' },
                            { id: 'Left-arm Fast / Medium', label: 'Left-Arm Fast / Pace / Medium' },
                            { id: 'Right-arm Off-Spin', label: 'Right-Arm Off-Spin' },
                            { id: 'Right-arm Leg-Spin', label: 'Right-Arm Leg-Spin / Googly' },
                            { id: 'Left-arm Orthodox', label: 'Left-Arm Orthodox Spin / Chinaman' },
                            { id: 'Wicketkeeper / Non-bowler', label: 'Pure Wicketkeeper / Non-Bowler' },
                          ]}
                          value={currentBowlingStyle ? { id: currentBowlingStyle, label: currentBowlingStyle } : null}
                          onChange={(item) => setValue('bowlingStyle', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Cricket Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience Level"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Box Cricket / Weekend Friendly' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (Club, College, Turf League)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Seasoned RPL Veteran / Division Player' },
                          ]}
                          value={currentCricketExp ? { id: currentCricketExp, label: currentCricketExp } : null}
                          onChange={(item) => setValue('cricketExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Football Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('football') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-emerald-50/90 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">⚽</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Football Championship Questions
                          </h3>
                          <p className="text-emerald-800 text-xs font-semibold">
                            Tactical pitch position, preferred shooting foot & turf experience
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Preferred Field Position <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Position"
                          items={[
                            { id: 'Forward / Striker', label: 'Forward / Striker (ST / CF)' },
                            { id: 'Winger (LW / RW)', label: 'Winger (LW / RW)' },
                            { id: 'Attacking Midfielder (CAM)', label: 'Attacking Midfielder (CAM / Playmaker)' },
                            { id: 'Central / Defensive Midfielder (CM / CDM)', label: 'Central / Defensive Midfielder (CM / CDM)' },
                            { id: 'Fullback (LB / RB)', label: 'Fullback / Wing Back (LB / RB)' },
                            { id: 'Centre Back (CB)', label: 'Centre Back (CB / Defender)' },
                            { id: 'Goalkeeper (GK)', label: 'Goalkeeper (GK)' },
                          ]}
                          value={currentFootballPos ? { id: currentFootballPos, label: currentFootballPos } : null}
                          onChange={(item) => setValue('footballPosition', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Dominant / Preferred Foot <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Preferred Foot"
                          items={[
                            { id: 'Right foot', label: 'Right Footed' },
                            { id: 'Left foot', label: 'Left Footed' },
                            { id: 'Both / Ambidextrous', label: 'Both / Ambidextrous (Two-Footed)' },
                          ]}
                          value={currentFootballFoot ? { id: currentFootballFoot, label: currentFootballFoot } : null}
                          onChange={(item) => setValue('preferredFoot', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Football / Turf Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience Level"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Recreational Turf Player' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (Inter-College / Turf League Regular)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Semi-Pro / Past RPL Champion' },
                          ]}
                          value={currentFootballExp ? { id: currentFootballExp, label: currentFootballExp } : null}
                          onChange={(item) => setValue('footballExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Badminton Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('badminton') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-cyan-50/90 rounded-3xl p-6 sm:p-8 border-2 border-cyan-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-cyan-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏸</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Badminton Championship Questions
                          </h3>
                          <p className="text-cyan-800 text-xs font-semibold">
                            Singles / doubles category, playing hand & match experience
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-200 text-cyan-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Preferred Event <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Event"
                          items={[
                            { id: 'Singles', label: "Men's / Women's Singles" },
                            { id: 'Doubles', label: "Men's / Women's Doubles" },
                            { id: 'Mixed Doubles', label: 'Mixed Doubles' },
                          ]}
                          value={currentBadmintonCat ? { id: currentBadmintonCat, label: currentBadmintonCat } : null}
                          onChange={(item) => setValue('badmintonCategory', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Dominant Hand <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Dominant Hand"
                          items={[
                            { id: 'Right-handed', label: 'Right-Handed' },
                            { id: 'Left-handed', label: 'Left-Handed' },
                          ]}
                          value={currentBadmintonHand ? { id: currentBadmintonHand, label: currentBadmintonHand } : null}
                          onChange={(item) => setValue('badmintonHand', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Recreational' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (Club / Tournament)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Competitive' },
                          ]}
                          value={currentBadmintonExp ? { id: currentBadmintonExp, label: currentBadmintonExp } : null}
                          onChange={(item) => setValue('badmintonExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Table Tennis Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('table-tennis') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-indigo-50/90 rounded-3xl p-6 sm:p-8 border-2 border-indigo-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏓</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Table Tennis Championship Questions
                          </h3>
                          <p className="text-indigo-800 text-xs font-semibold">
                            Singles / doubles format, paddle grip & tournament level
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-200 text-indigo-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Format <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Format"
                          items={[
                            { id: 'Singles', label: 'Singles Championship' },
                            { id: 'Doubles', label: 'Doubles Championship' },
                          ]}
                          value={currentTtCat ? { id: currentTtCat, label: currentTtCat } : null}
                          onChange={(item) => setValue('ttCategory', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Paddle Grip Style <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Grip Style"
                          items={[
                            { id: 'Shakehand Grip', label: 'Shakehand Grip' },
                            { id: 'Penhold Grip', label: 'Penhold Grip' },
                          ]}
                          value={currentTtGrip ? { id: currentTtGrip, label: currentTtGrip } : null}
                          onChange={(item) => setValue('ttGrip', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Casual' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (Club Player)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Tournament Pro' },
                          ]}
                          value={currentTtExp ? { id: currentTtExp, label: currentTtExp } : null}
                          onChange={(item) => setValue('ttExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pickleball Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('pickleball') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-orange-50/90 rounded-3xl p-6 sm:p-8 border-2 border-orange-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-orange-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🎾</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Pickleball Championship Questions
                          </h3>
                          <p className="text-orange-800 text-xs font-semibold">
                            Skill rating, doubles division & partner details
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Division / Category <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Division"
                          items={[
                            { id: 'Men Doubles', label: "Men's Doubles" },
                            { id: 'Women Doubles', label: "Women's Doubles" },
                            { id: 'Mixed Doubles', label: 'Mixed Doubles' },
                            { id: 'Men Singles', label: "Men's Singles" },
                            { id: 'Women Singles', label: "Women's Singles" },
                          ]}
                          value={currentPickleballCat ? { id: currentPickleballCat, label: currentPickleballCat } : null}
                          onChange={(item) => setValue('pickleballCategory', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Skill Rating / DUPR <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Skill"
                          items={[
                            { id: '2.5 - 3.0 (Beginner)', label: '2.5 - 3.0 (Recreational)' },
                            { id: '3.5 (Intermediate)', label: '3.5 (Intermediate / League)' },
                            { id: '4.0+ (Advanced)', label: '4.0+ (Advanced / Open)' },
                          ]}
                          value={currentPickleballSkill ? { id: currentPickleballSkill, label: currentPickleballSkill } : null}
                          onChange={(item) => setValue('pickleballSkill', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Preferred Partner Name <span className="text-slate-500 text-[10px]">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Partner's Name (if any)"
                          {...register('pickleballPartner')}
                          className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-white border border-orange-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Volleyball / Throwball Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('volleyball') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-purple-50/90 rounded-3xl p-6 sm:p-8 border-2 border-purple-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-purple-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏐</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Volleyball & Throwball Questions
                          </h3>
                          <p className="text-purple-800 text-xs font-semibold">
                            Net position, court specialty & experience
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Playing Role / Specialty <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Role"
                          items={[
                            { id: 'Spiker / Attacker', label: 'Spiker / Outside Attacker' },
                            { id: 'Setter', label: 'Setter / Playmaker' },
                            { id: 'Libero / Defender', label: 'Libero / Court Defender' },
                            { id: 'Throwball Player', label: 'Throwball Specialist' },
                          ]}
                          value={currentVolleyballRole ? { id: currentVolleyballRole, label: currentVolleyballRole } : null}
                          onChange={(item) => setValue('volleyballRole', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Casual' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (College / Club)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Seasoned Tournament Regular' },
                          ]}
                          value={currentVolleyballExp ? { id: currentVolleyballExp, label: currentVolleyballExp } : null}
                          onChange={(item) => setValue('volleyballExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Women's Sports Questions with BasicDropdown */}
              <AnimatePresence>
                {selectedSports.includes('womens-sports') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-pink-50/90 rounded-3xl p-6 sm:p-8 border-2 border-pink-300 shadow-md space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-pink-200 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                            Women's Championship Questions
                          </h3>
                          <p className="text-pink-800 text-xs font-semibold">
                            Select discipline (Cricket, Football, Throwball) & specific role
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-pink-200 text-pink-900 font-bold text-xs">
                        Active Sport
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Championship Discipline <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Discipline"
                          items={[
                            { id: "Women's Cricket", label: "Women's Cricket" },
                            { id: "Women's Football", label: "Women's Football" },
                            { id: 'Throwball', label: 'Throwball Championship' },
                          ]}
                          value={currentWomensCat ? { id: currentWomensCat, label: currentWomensCat } : null}
                          onChange={(item) => setValue('womensCategory', String(item.id), { shouldValidate: true })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Specialty / Role <span className="text-pink-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Attacker, Setter, Bowler, Striker"
                          {...register('womensPlayingRole')}
                          className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-white border border-pink-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                          Experience Level <span className="text-pink-600">*</span>
                        </label>
                        <BasicDropdown
                          label="Select Experience"
                          items={[
                            { id: 'Beginner / Casual', label: 'Beginner / Enthusiastic Participant' },
                            { id: 'Intermediate (Club / College)', label: 'Intermediate (School / College / Community)' },
                            { id: 'Advanced / RPL Veteran', label: 'Advanced / Tournament Regular' },
                          ]}
                          value={currentWomensExp ? { id: currentWomensExp, label: currentWomensExp } : null}
                          onChange={(item) => setValue('womensExperience', String(item.id), { shouldValidate: true })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 4: APPAREL CUSTOMIZATION & TEAM SQUAD INFO */}
            {/* ========================================================================= */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-md space-y-6"
            >
              <div className="flex items-start space-x-3 border-b border-slate-100 pb-4 sm:pb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md shadow-amber-500/20 shrink-0 aspect-square mt-0.5">
                  3
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg sm:text-2xl font-extrabold text-slate-900">
                    Jersey Print & Team Squad Notes (Optional)
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Personalize your tournament jersey and squad preferences
                  </p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Name on Back of Jersey <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MOKSH"
                    {...register('customJerseyName')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Preferred Jersey Number <span className="text-slate-500 text-[10px]">(0-99, Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. 7, 10, 18, 99"
                    {...register('preferredJerseyNumber')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Preferred Team / Squad Name <span className="text-slate-500 text-[10px]">(If registering alongside a squad)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vitraag Strikers, Mumbai Titans"
                    {...register('preferredTeamName')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </InView>

            {/* ========================================================================= */}
            {/* SUBMIT BUTTON & GMAIL CONFIRMATION CALLOUT */}
            {/* ========================================================================= */}
            <InView
              viewOptions={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border-2 border-amber-300 shadow-md space-y-4 text-slate-800"
            >
              <div className="flex items-start space-x-3 text-slate-700">
                <Mail className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  Upon clicking <strong className="text-slate-900 font-extrabold">Submit Registration</strong>, your entry details will be recorded, and Gmail compose will launch with all your sport details pre-filled to send directly to the organizing team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-amber-200/80">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified RPL Season 9 Multi-Sport Entry</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-white font-extrabold text-base md:text-lg shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer touch-manipulation disabled:opacity-75 group border border-amber-300/30"
                >
                  {isSubmitting ? (
                    <span>Submitting Registration...</span>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <Zap className="w-5 h-5 fill-amber-200 text-amber-200 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>

              </div>
            </InView>



          </form>
        )}
      </div>
    </div>
  );
};
