import React from 'react';
import { FileText, ArrowLeft, AlertCircle, Users, Trophy, CreditCard, Camera, Scale, Mail } from 'lucide-react';

interface TermsPageProps {
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

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
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
            <FileText className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-800">Terms &amp; Conditions</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            <FileText className="w-3.5 h-3.5" />
            Terms &amp; Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Rules of Engagement
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            By registering for or participating in the Raj Premier League (RPL), you agree to the following terms and conditions. Please read them carefully.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: September 30, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">

          <div className="mb-10 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">
              These Terms &amp; Conditions ("Terms") govern your participation in the Raj Premier League, a community sports initiative. By submitting your registration, you confirm that you have read, understood, and agree to be bound by these Terms.
            </p>
          </div>

          <Section icon={<Users className="w-4 h-4" />} title="Eligibility &amp; Registration">
            <p>To participate in RPL, you must meet the following eligibility requirements:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Participants must be at least 16 years of age. Players under 18 must have written parental/guardian consent.</li>
              <li>Registration must be completed through the official RPL platform using accurate and truthful information.</li>
              <li>Each participant may only register once per season per sport. Duplicate registrations will be cancelled without refund.</li>
              <li>RPL reserves the right to reject any registration at its sole discretion without providing reasons.</li>
              <li>All registered players are subject to the team draft/selection process conducted by RPL organizers.</li>
            </ul>
          </Section>

          <Section icon={<Trophy className="w-4 h-4" />} title="Participation &amp; Conduct">
            <p>All participants are expected to uphold the spirit of fair play and community sportsmanship. The following conduct rules apply:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Fair Play:</strong> Any form of cheating, match-fixing, or unsporting behavior will result in immediate disqualification.</li>
              <li><strong>Respect:</strong> Verbal abuse, harassment, discrimination, or threatening behavior toward other players, officials, or organizers is strictly prohibited.</li>
              <li><strong>Punctuality:</strong> Players must arrive on time for scheduled matches. Repeated absence without prior notice may result in removal from the league.</li>
              <li><strong>Equipment:</strong> Players are responsible for wearing appropriate sports attire. RPL may provide team jerseys; tampering with official kit is not permitted.</li>
              <li><strong>Compliance:</strong> All players must comply with the rules of the respective sport as administered by RPL officials on the day of play.</li>
            </ul>
            <p className="mt-3">RPL organizers' decisions regarding on-field incidents are final and binding.</p>
          </Section>

          <Section icon={<CreditCard className="w-4 h-4" />} title="Registration Fees &amp; Refunds">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Registration fees are due at the time of sign-up and must be paid in full to secure your spot in the league.</li>
              <li>All fees are non-refundable once a season has commenced, except in cases where RPL cancels an event.</li>
              <li>If a player is found ineligible or disqualified for misconduct after registration, no refund will be issued.</li>
              <li>In the event of season cancellation by RPL due to unforeseen circumstances (e.g., weather, safety concerns), participants will be offered a credit toward the next season or a partial refund at RPL's discretion.</li>
              <li>Payment disputes must be raised within 7 days of the transaction by contacting the organizers.</li>
            </ul>
          </Section>

          <Section icon={<AlertCircle className="w-4 h-4" />} title="Health, Safety &amp; Liability">
            <p>By participating in RPL events, you acknowledge and agree to the following:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Sports activities carry inherent physical risks. You participate voluntarily and at your own risk.</li>
              <li>You confirm that you are in good health and physically fit to participate in your chosen sport.</li>
              <li>RPL and its organizers are not liable for any injuries, losses, or damages sustained during matches, training, or related events.</li>
              <li>We strongly encourage all participants to hold personal sports insurance or health coverage.</li>
              <li>First aid facilities will be made available at venues where possible. In the event of a serious medical emergency, participants should call emergency services immediately.</li>
            </ul>
          </Section>

          <Section icon={<Camera className="w-4 h-4" />} title="Media, Photography &amp; Publicity">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>By registering for RPL, you grant the league a royalty-free, non-exclusive license to use photographs, videos, and other media featuring you for promotional and documentary purposes.</li>
              <li>Such media may be published on RPL's official website, social media channels (Instagram, YouTube, WhatsApp), and any future promotional materials.</li>
              <li>If you do not wish to appear in published media, you must notify the organizers in writing before the start of the season.</li>
              <li>Participants may not commercially exploit RPL's name, logo, or branding without express written permission.</li>
            </ul>
          </Section>

          <Section icon={<Scale className="w-4 h-4" />} title="Disciplinary Procedures &amp; Bans">
            <p>RPL reserves the right to take disciplinary action against any participant who violates these Terms. Actions may include:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Formal written warning.</li>
              <li>Temporary suspension from one or more matches.</li>
              <li>Permanent ban from the current or future RPL seasons.</li>
              <li>Reporting to relevant authorities in cases of criminal behavior.</li>
            </ul>
            <p className="mt-3">Participants have the right to appeal disciplinary decisions by submitting a written appeal to the RPL committee within 48 hours of the decision. The committee's ruling on appeal is final.</p>
          </Section>

          <Section icon={<FileText className="w-4 h-4" />} title="Amendments to Terms">
            <p>
              RPL reserves the right to modify these Terms at any time. Significant changes will be communicated to registered participants via email or through the platform. Your continued participation following the notification of changes constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section icon={<Mail className="w-4 h-4" />} title="Contact &amp; Dispute Resolution">
            <p>For questions, complaints, or disputes regarding these Terms, please contact us:</p>
            <ul className="list-none space-y-2 mt-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>info.rplevents@gmail.com</span>
              </li>
              <li>
                <span className="font-semibold text-slate-700">Raj Premier League — Official Organizers</span>
              </li>
            </ul>
            <p className="mt-4">
              All disputes will first be attempted to be resolved amicably. If unresolved, disputes shall be subject to the jurisdiction of the courts applicable to the location of the RPL organizing body.
            </p>
          </Section>

          <div className="mt-10 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Agreement:</strong> By registering for and/or participating in any RPL event, you confirm that you have read, understood, and agree to comply with these Terms &amp; Conditions in their entirety. These Terms constitute a binding agreement between you and the Raj Premier League.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
