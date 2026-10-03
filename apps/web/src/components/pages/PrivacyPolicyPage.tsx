import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, Share2, Bell, Mail, MapPin, Building2 } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
    </div>
    <div className="pl-12 text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-800">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-3.5 h-3.5" />
            Privacy &amp; Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Your Privacy &amp; Data Security
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            This policy outlines how the Raj Premier League (RPL) at Shrimad Rajchandra Aatma Tatva Research Centre collects, utilizes, and protects your personal and payment details.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: October 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">

          <div className="mb-10 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              The <strong>Raj Premier League (RPL)</strong>, hosted at <strong>Shrimad Rajchandra Aatma Tatva Research Centre, Parli</strong> ("we", "us", or "our"), is dedicated to safeguarding the privacy and personal data of our participants and visitors. This Privacy Policy details our data collection practices in compliance with applicable Indian data protection standards and online payment processing guidelines.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <Section icon={<Database className="w-4 h-4" />} title="1. Information We Collect">
            <p>When you register for tournament events or interact with our portal, we collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Personal Identification Data:</strong> Full Name, Date of Birth, Gender, Home Centre/City, and Player Photograph (shared with third-party auction platform <a href="https://auctionarena.in/" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline font-medium hover:text-amber-700">https://auctionarena.in/</a> for player profile creation and team auction bidding).</li>
              <li><strong>Contact Information:</strong> Active Mobile Number and Email Address (utilized strictly for communication purposes, including tournament updates, match announcements, schedule changes, and emergency notifications).</li>
              <li><strong>Athletic &amp; Kit Preferences:</strong> Selected sports (Cricket and Football), preferred jersey sizes (XS–XXXL), custom jersey names, preferred numbers, and cricket playing styles.</li>
              <li><strong>Hospitality &amp; Research Centre Stay:</strong> Check-in and check-out dates, food preference (Spicy / Non-Spicy), and accommodation records.</li>
              <li><strong>Payment Metadata:</strong> Transaction reference IDs, Razorpay Order IDs, Payment IDs, and UTR numbers. <em>Note:</em> We do not store or have access to your credit/debit card numbers, CVVs, or Net Banking PINs. All payment transactions are encrypted and processed through Razorpay.</li>
              <li><strong>System &amp; Security Logs:</strong> IP address, device type, browser information, and server correlation identifiers (<code>X-Request-Id</code>) to monitor system health and prevent fraudulent activities.</li>
            </ul>
          </Section>

          {/* 2. How We Use Information */}
          <Section icon={<Eye className="w-4 h-4" />} title="2. Purpose of Data Processing">
            <p>Your information is used strictly for legitimate tournament administration and Research Centre hospitality purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Processing your tournament enrollment and generating official team rosters.</li>
              <li>Issuing your digital player pass, verification QR codes, and payment receipts.</li>
              <li>Synchronizing participant guest identities and Research Centre stay records with the central <strong>Aashray</strong> system at Shrimad Rajchandra Aatma Tatva Research Centre for gate security and room allocations.</li>
              <li>Delivering critical tournament notifications, match schedules, and room waitlist updates via WhatsApp and Email.</li>
              <li>Reconciling financial transactions and maintaining audited bookkeeping records.</li>
            </ul>
          </Section>

          {/* 3. Data Protection & Security */}
          <Section icon={<Lock className="w-4 h-4" />} title="3. Security &amp; Encryption Standards">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Encrypted Communications:</strong> The platform operates exclusively over HTTPS with TLS 1.3 encryption, ensuring all data transmitted between your browser and our servers is protected against interception.</li>
              <li><strong>Payment Gateway Compliance:</strong> Payments are handled by **Razorpay Software Private Limited**, certified under PCI-DSS Level 1 (the highest standard in payment security).</li>
              <li><strong>Sanitized Server Logs:</strong> Server activity logging automatically redacts sensitive data (such as passwords, tokens, and cryptographic signatures) before writing to daily rotating logs.</li>
              <li><strong>Cloud Storage:</strong> Player photos and documents are secured on enterprise cloud storage with authenticated access controls.</li>
            </ul>
          </Section>

          {/* 4. Third-Party Disclosures */}
          <Section icon={<Share2 className="w-4 h-4" />} title="4. Third-Party Sharing &amp; Non-Disclosure">
            <p>We strictly respect your privacy. <strong>We do not sell, rent, monetize, or trade your personal data to commercial advertisers or marketing agencies.</strong> Your data is shared only with trusted operational entities necessary to conduct the tournament:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Auction Platform (<a href="https://auctionarena.in/" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline font-medium hover:text-amber-700">https://auctionarena.in/</a>):</strong> Player name, photograph, and athletic profile details are shared with the third-party auction platform for player rosters, team bidding, and live auction management.</li>
              <li><strong>Host Institution:</strong> The administration of Shrimad Rajchandra Aatma Tatva Research Centre for room reservations, dining hall access, and Research Centre security clearance.</li>
              <li><strong>Payment Gateway Partner:</strong> Razorpay Software Private Limited for authorizing and settling online payment transactions.</li>
              <li><strong>Communication Gateways:</strong> WhatsApp Cloud API and Email providers solely for communication purposes such as schedule updates, announcements, and emergency notifications.</li>
              <li><strong>Legal Obligations:</strong> Regulatory authorities or law enforcement agencies if compelled by applicable law or judicial orders.</li>
            </ul>
          </Section>

          {/* 5. Data Retention & User Rights */}
          <Section icon={<Bell className="w-4 h-4" />} title="5. Data Retention &amp; Participant Rights">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We retain tournament registration and financial audit records for the duration necessary to satisfy sports organization and financial compliance obligations.</li>
              <li>Participants have the right to request access to their registration data, request corrections to inaccurate contact information, or seek clarification on data handling.</li>
            </ul>
          </Section>

          {/* 6. Grievance Redressal & Contact */}
          <Section icon={<MapPin className="w-4 h-4" />} title="6. Grievance Officer &amp; Research Centre Contact">
            <p>If you have any questions, concerns, or inquiries regarding your privacy or our data practices, please reach out to our grievance team:</p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p><strong>Organization:</strong> Raj Premier League (RPL) Organizing Committee</p>
              <p><strong>Host Institution:</strong> Shrimad Rajchandra Aatma Tatva Research Centre</p>
              <p><strong>Contact Helpline:</strong> <a href="tel:+919321001499" className="text-amber-600 font-semibold hover:underline">+91 9321001499</a></p>
              <p><strong>Email Address:</strong> <a href="mailto:info.rplevents@gmail.com" className="text-amber-600 font-semibold hover:underline">info.rplevents@gmail.com</a></p>
              <p><strong>Research Centre Address:</strong> Raj Nagar, Parli, Post Gothavade, Taluka Sudhagad, Off Khopoli-Pali Road, Dist. Raigad - 410205, Maharashtra, India.</p>
              <p><strong>Support Response:</strong> Within 24–48 working hours.</p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
