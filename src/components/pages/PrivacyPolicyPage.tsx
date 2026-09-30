import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, Share2, Bell, Mail } from 'lucide-react';

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
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors"
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
            Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Your Privacy Matters to Us
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            This policy explains how Raj Premier League (RPL) collects, uses, and protects your personal information when you use our platform.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: September 30, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">

          <Section icon={<Eye className="w-4 h-4" />} title="Information We Collect">
            <p>When you register for RPL or use our platform, we may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Personal Identification:</strong> Full name, age, gender, and photograph (where provided).</li>
              <li><strong>Contact Information:</strong> Email address, phone number, and WhatsApp contact.</li>
              <li><strong>Team &amp; Sport Information:</strong> Preferred sport (Cricket, Football, or Women's League), team preferences, and playing position.</li>
              <li><strong>Payment Information:</strong> Registration fee payment references (we do not store card or banking details directly).</li>
              <li><strong>Usage Data:</strong> Browser type, device information, pages visited, and interaction logs for improving our platform.</li>
            </ul>
          </Section>

          <Section icon={<Database className="w-4 h-4" />} title="How We Use Your Information">
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Processing and confirming your tournament registration.</li>
              <li>Communicating updates, schedule changes, and match notifications.</li>
              <li>Organizing teams, fixtures, and scoreboards for the league season.</li>
              <li>Publishing player profiles and statistics on our official platform (with consent).</li>
              <li>Improving our website and user experience through anonymized analytics.</li>
              <li>Sending promotional content about future RPL seasons (you may opt out at any time).</li>
            </ul>
          </Section>

          <Section icon={<Share2 className="w-4 h-4" />} title="Information Sharing &amp; Disclosure">
            <p>We respect your privacy and do not sell your personal data. We may share your information in limited circumstances:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Within RPL:</strong> Organizers, team captains, and match officials may access relevant player data for operational purposes.</li>
              <li><strong>Public Scoreboards:</strong> Player names and match statistics may be displayed publicly on our platform and social media.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights and safety of participants.</li>
              <li><strong>Service Providers:</strong> Trusted third-party tools (e.g., hosting, payment processors) that operate under strict data agreements.</li>
            </ul>
            <p className="mt-3">We never share your contact details with third-party advertisers without your explicit consent.</p>
          </Section>

          <Section icon={<Lock className="w-4 h-4" />} title="Data Security">
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Encrypted data storage and transmission (HTTPS/TLS).</li>
              <li>Access controls limiting who can view sensitive participant data.</li>
              <li>Regular security reviews of our platform and infrastructure.</li>
            </ul>
            <p className="mt-3">
              While we take all reasonable precautions, no system is 100% secure. We encourage you to use a strong, unique password and report any suspicious activity to our team.
            </p>
          </Section>

          <Section icon={<Bell className="w-4 h-4" />} title="Cookies &amp; Tracking">
            <p>
              Our website may use cookies and similar technologies to enhance your browsing experience. These include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Essential Cookies:</strong> Required for core functionality such as authentication and session management.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform (anonymized).</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences for future visits.</li>
            </ul>
            <p className="mt-3">You can manage or disable cookies through your browser settings. Disabling essential cookies may affect your ability to register or access certain features.</p>
          </Section>

          <Section icon={<Shield className="w-4 h-4" />} title="Your Rights">
            <p>You have the following rights with respect to your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal and operational requirements).</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at the details below.</p>
          </Section>

          <Section icon={<Mail className="w-4 h-4" />} title="Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:</p>
            <ul className="list-none space-y-2 mt-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>info.rplevents@gmail.com</span>
              </li>
              <li>
                <span className="font-semibold text-slate-700">Raj Premier League — Official Organizers</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">We will respond to all legitimate requests within 14 business days.</p>
          </Section>

          <div className="mt-10 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Policy Updates:</strong> We may update this Privacy Policy from time to time. We will notify registered participants of any significant changes via email or an in-platform notice. Continued use of the RPL platform after such changes constitutes your acceptance of the updated policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
