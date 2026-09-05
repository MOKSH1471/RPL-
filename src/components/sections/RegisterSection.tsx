import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import confetti from 'canvas-confetti';
import { registrationSchema, RegistrationSchemaType } from '@/lib/validation';
import { LeagueType, RegistrationFormData } from '@/types';
import { RegistrationTicket } from '@/components/ui/RegistrationTicket';
import Stepper, { Step } from '@/components/ui/Stepper';
import { Trophy, Target, Heart, AlertCircle, Mail, Upload } from 'lucide-react';

interface RegisterSectionProps {
  selectedLeague: LeagueType;
  onLeagueTabChange: (league: LeagueType) => void;
}

export const RegisterSection: React.FC<RegisterSectionProps> = ({
  selectedLeague,
  onLeagueTabChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');

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
      recipientGmail: 'rpl@rajpremierleague.com',
      ccEmail: '',
      fullName: '',
      mobileNumber: '',
      email: '',
      dateOfBirth: '',
      centre: 'Mumbai',
      existingRplFamily: 'No',
      gender: 'Male',
      tshirtSize: 'L',
      foodPreference: 'Regular',
      accommodationRequired: 'No',
      league: selectedLeague,
      cricketRole: 'Batter',
      footballPosition: 'Forward',
      womensCategory: "Women's Cricket",
      preferredTeamName: '',
    },
  });

  React.useEffect(() => {
    setValue('league', selectedLeague);
  }, [selectedLeague, setValue]);

  const currentLeague = watch('league');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
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

  const onSubmit = async (data: RegistrationSchemaType) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const generatedId = `RPL9-${Math.floor(100000 + Math.random() * 900000)}`;
    const leagueVal = (data.league || 'cricket') as LeagueType;

    const fullData: RegistrationFormData = {
      recipientGmail: data.recipientGmail || 'rpl@rajpremierleague.com',
      ccEmail: data.ccEmail,
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      photoName: photoName || undefined,
      photoDataUrl: photoPreview || undefined,
      centre: data.centre,
      existingRplFamily: data.existingRplFamily,
      gender: data.gender,
      tshirtSize: data.tshirtSize,
      foodPreference: data.foodPreference,
      accommodationRequired: data.accommodationRequired,
      selectedSports: [leagueVal as any],
      league: leagueVal,
      cricketRole: data.cricketRole as any,
      battingStyle: data.battingStyle,
      footballPosition: data.footballPosition as any,
      womensCategory: data.womensCategory as any,
      preferredTeamName: data.preferredTeamName,
    };

    const existing = JSON.parse(localStorage.getItem('rpl_registrations') || '[]');
    localStorage.setItem('rpl_registrations', JSON.stringify([...existing, { id: generatedId, ...fullData }]));

    const targetEmail = data.recipientGmail || 'rpl@rajpremierleague.com';
    const cc = data.ccEmail ? `&cc=${encodeURIComponent(data.ccEmail)}` : '';
    const subject = encodeURIComponent(`[RPL Season 9 Registration] ${data.fullName} - ${leagueVal.toUpperCase()}`);
    const emailBodyText = `
RAJ PREMIER LEAGUE (RPL SEASON 9) REGISTRATION DETAILS
------------------------------------------------------
Registration ID: ${generatedId}
Full Name: ${data.fullName}
Mobile Number: ${data.mobileNumber}
Email ID: ${data.email}
Date of Birth: ${data.dateOfBirth}
Centre: ${data.centre}
Existing RPL Family: ${data.existingRplFamily}
Gender: ${data.gender}
T-Shirt Size: ${data.tshirtSize}
Food Preference: ${data.foodPreference}
Accommodation Required: ${data.accommodationRequired}

LEAGUE SPECIFICS:
League: ${leagueVal.toUpperCase()}
${leagueVal === 'cricket' ? `Cricket Role: ${data.cricketRole}` : ''}
${leagueVal === 'football' ? `Football Position: ${data.footballPosition}` : ''}
${leagueVal === 'womens' ? `Women's Category: ${data.womensCategory}` : ''}
Preferred Team Name: ${data.preferredTeamName || 'N/A'}
------------------------------------------------------
Sent via RPL Official Registration Portal
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

    // Scroll to registration ticket view
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EC4899', '#10B981'],
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
  };

  return (
    <section id="register" className="py-20 md:py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-600 block mb-3">
            OFFICIAL REGISTRATION FORM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4">
            Secure Your <span className="text-gradient-vibrant">Spot</span>
          </h2>
          <p className="text-slate-700 text-xs sm:text-base font-medium">
            Use the step-by-step options stepper below. Opens pre-filled Gmail compose upon final completion.
          </p>
        </div>

        {submittedData ? (
          <RegistrationTicket
            data={submittedData}
            registrationId={registrationId}
            onReset={handleReset}
          />
        ) : (
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleSubmit(onSubmit)}
            nextButtonText="Next Step →"
            backButtonText="← Back"
          >
            {/* Step 1: Arena Choice & Gmail Config */}
            <Step>
              <div className="space-y-6">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                  Step 1: Championship Arena & Gmail Target
                </h3>

                {/* League Switcher Tabs with Thumb-Friendly Touch Targets */}
                <div>
                  <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-3">
                    Select Championship League *
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                    {[
                      { id: 'cricket' as LeagueType, label: 'Cricket', icon: Trophy, color: 'text-amber-600' },
                      { id: 'football' as LeagueType, label: 'Football', icon: Target, color: 'text-emerald-600' },
                      { id: 'womens' as LeagueType, label: "Women's", icon: Heart, color: 'text-pink-600' },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = currentLeague === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setValue('league', tab.id);
                            onLeagueTabChange(tab.id);
                          }}
                          className={`flex items-center justify-center space-x-1.5 py-3.5 px-3 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm transition-all touch-manipulation ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md scale-[1.02]'
                              : 'text-slate-700 hover:text-slate-900 active:bg-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gmail Configuration Callout Block */}
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/80 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3 text-amber-700">
                    <Mail className="w-5 h-5" />
                    <h4 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                      Gmail Dispatch Configuration
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    Submitting will launch Gmail compose with all registration options pre-filled to this address.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Target Gmail Address
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="your-email@gmail.com"
                        {...register('recipientGmail')}
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        CC Email (Optional)
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="cc-email@gmail.com"
                        {...register('ccEmail')}
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 2: Personal & Contact Info with Mobile Keypads */}
            <Step>
              <div className="space-y-6">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                  Step 2: Personal & Contact Information
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Full Name <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.fullName.message}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Mobile Number <span className="text-pink-600">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl bg-slate-200 border border-r-0 border-slate-300 text-slate-900 font-bold text-sm min-h-[48px]">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="XXXXXXXXXX"
                        {...register('mobileNumber')}
                        className="w-full px-4 py-3.5 min-h-[48px] rounded-r-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.mobileNumber.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email ID <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Date of Birth <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.dateOfBirth.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Centre <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('centre')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                    >
                      <option value="">Select Centre</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Surat">Surat</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="London">London (UK)</option>
                      <option value="USA">USA / Canada</option>
                      <option value="Other">Other Centre</option>
                    </select>
                    {errors.centre && (
                      <p className="mt-1.5 text-xs text-pink-600 flex items-center space-x-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.centre.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 3: Photo Upload & RPL Identity */}
            <Step>
              <div className="space-y-6">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                  Step 3: Photo Upload & RPL Identity
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Upload Photo <span className="text-pink-600">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center transition-all bg-slate-50 cursor-pointer min-h-[120px] flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {photoPreview ? (
                      <div className="flex items-center justify-center space-x-4">
                        <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-sm" />
                        <div className="text-left">
                          <span className="text-sm font-bold text-slate-900 block">{photoName}</span>
                          <span className="text-xs text-emerald-600 font-bold">Photo loaded successfully</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-amber-600 mx-auto" />
                        <p className="text-sm text-slate-800 font-bold">
                          Click or drag photo here (JPG, PNG, max 5MB)
                        </p>
                        <span className="text-xs text-slate-500 block">No file chosen</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Existing RPL Family <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('existingRplFamily')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Gender <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 4: Apparel, Food & Accommodation */}
            <Step>
              <div className="space-y-6">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                  Step 4: Apparel, Food & Logistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      T-Shirt Size <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('tshirtSize')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Food Preference (Spice Level) <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('foodPreference')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Non-Spicy">Non-Spicy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Accommodation Required <span className="text-pink-600">*</span>
                    </label>
                    <select
                      {...register('accommodationRequired')}
                      className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 5: League Specific Questionnaire */}
            <Step>
              <div className="space-y-6">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                  Step 5: {(currentLeague || 'cricket').toUpperCase()} League Specifics
                </h3>


                {currentLeague === 'cricket' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
                    <h4 className="font-display text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider">
                      Cricket League Position Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                          Playing Role <span className="text-pink-600">*</span>
                        </label>
                        <select
                          {...register('cricketRole')}
                          className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                        >
                          <option value="Batter">Batter</option>
                          <option value="Bowler">Bowler</option>
                          <option value="All-rounder">All-rounder</option>
                          <option value="Wicketkeeper">Wicketkeeper</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                          Batting / Bowling Style <span className="text-slate-500 text-[10px]">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Right-hand batter, Off-spinner"
                          {...register('battingStyle')}
                          className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-base sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentLeague === 'football' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                    <h4 className="font-display text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider">
                      Football League Position Details
                    </h4>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                        Playing Position <span className="text-pink-600">*</span>
                      </label>
                      <select
                        {...register('footballPosition')}
                        className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-base sm:text-sm"
                      >
                        <option value="Forward">Forward / Striker</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Defender">Defender</option>
                        <option value="Goalkeeper">Goalkeeper</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentLeague === 'womens' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-pink-50 border border-pink-200 space-y-4">
                    <h4 className="font-display text-xs sm:text-sm font-bold text-pink-800 uppercase tracking-wider">
                      Women's League Category Details
                    </h4>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                        Sport Category <span className="text-pink-600">*</span>
                      </label>
                      <select
                        {...register('womensCategory')}
                        className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-pink-500 text-base sm:text-sm"
                      >
                        <option value="Women's Cricket">Women's Cricket</option>
                        <option value="Women's Football">Women's Football</option>
                        <option value="Throwball">Throwball</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Preferred Team Name <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="If registering alongside a squad"
                    {...register('preferredTeamName')}
                    className="w-full px-4 py-3.5 min-h-[48px] rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-all text-base sm:text-sm"
                  />
                </div>
              </div>
            </Step>
          </Stepper>
        )}
      </div>
    </section>
  );
};
