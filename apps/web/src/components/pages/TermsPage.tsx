import React from 'react';
import { FileText, ArrowLeft, AlertCircle, Users, Trophy, CreditCard, Camera, Scale, Mail, RefreshCw, Send, MapPin, Building2 } from 'lucide-react';

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
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
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
            Rules of Engagement &amp; Service Terms
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            By registering for or participating in the Raj Premier League (RPL) hosted at Shrimad Rajchandra Aatma Tatva Research Centre, you agree to the following terms, conditions, and fulfillment policies.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: October 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">

          <div className="mb-10 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              These Terms &amp; Conditions ("Terms") govern registration, event participation, pass fulfillment, payment processing, and Research Centre hospitality for the <strong>Raj Premier League (RPL)</strong> held at the <strong>Shrimad Rajchandra Aatma Tatva Research Centre, Parli</strong>. By submitting a registration or completing an online transaction, you confirm that you have read, understood, and agreed to be bound by these Terms.
            </p>
          </div>

          {/* 1. Eligibility & Registration */}
          <Section icon={<Users className="w-4 h-4" />} title="1. Eligibility &amp; Participant Registration">
            <p>To participate in RPL tournament events, players must comply with the following criteria:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Age &amp; Guardian Consent:</strong> Players under 10 years of age must have prior parental or guardian consent and accompaniment during the event.</li>
              <li><strong>Authentic Details:</strong> Registration must be submitted through this official portal using valid and truthful personal information (Full Name, Contact Number, Email, Date of Birth, Gender, and Home Centre).</li>
              <li><strong>Aashray Identity &amp; Guest Card Creation:</strong> To coordinate tournament accreditation, Research Centre gate security, and room allocation, registering as a new participant automatically provisions a digital Guest Card in the central Aashray database. Participants can log in to the Aashray ecosystem using their mobile number and designated credentials.</li>
              <li><strong>Single Entry per Season:</strong> Each participant may register once per tournament season. Team assignments, draft rosters, and scheduling are managed exclusively by the RPL Committee.</li>
            </ul>
          </Section>

          {/* 2. Fee Structure & Payment Processing */}
          <Section icon={<CreditCard className="w-4 h-4" />} title="2. Fee Structure &amp; Secure Payment Processing">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Base Registration Fee:</strong> ₹2,500 includes enrollment in your primary sport, 2 nights of official tournament stay (Dec 25–27, 2026), meals, and the official player jersey kit.</li>
              <li><strong>Multi-Sport Add-ons:</strong> Additional sports are ₹400 per extra sport. Returning players adding sports only pay the incremental ₹400/sport.</li>
              <li><strong>Payment Gateway:</strong> Online transactions are encrypted and processed through <strong>Razorpay</strong> (supporting UPI, Net Banking, Debit Cards, and Credit Cards). We adhere to PCI-DSS security standards and do not store sensitive card credentials or CVVs on our servers.</li>
              <li><strong>Pay Later / Offline Verification:</strong> Registrations submitted under offline/pay later terms remain in <code>PENDING</code> status until verified by the administration. Tournament passes are validated upon confirmation of payment proof.</li>
            </ul>
          </Section>

          {/* 3. Cancellation & Refund Policy */}
          <Section icon={<RefreshCw className="w-4 h-4" />} title="3. Cancellation &amp; Refund Policy">
            <p>We maintain a clear cancellation and refund policy:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Partial Refund at Committee Discretion:</strong> All cancellations are evaluated on an individual basis. Any eligible refund is partial, subject to deduction of jersey manufacturing, accommodation commitment, and administrative overheads, and remains under the sole discretion of the RPL Organizing Committee.</li>
              <li><strong>Cancellations Close to Tournament:</strong> Registrations cancelled once player rosters, customized kits, and room allocations are finalized are non-refundable, except when approved specifically by the RPL Committee.</li>
              <li><strong>Refund Processing Timeline:</strong> Approved partial refunds will be processed within <strong>5 to 7 working days</strong> and credited back directly to the original payment source (UPI account, Bank Account, or Card) via Razorpay.</li>
              <li><strong>Event Rescheduling or Force Majeure:</strong> In the unforeseen event of tournament rescheduling due to force majeure, extreme weather conditions, or regulatory advisories, registrations will be transferred to rescheduled dates or handled at the discretion of the RPL Committee.</li>
              <li><strong>Misconduct &amp; Disqualification:</strong> No refunds will be issued if a participant is disqualified due to code of conduct breaches, disciplinary violations, or falsification of eligibility.</li>
            </ul>
          </Section>

          {/* 4. Pass Fulfillment & Delivery Policy */}
          <Section icon={<Send className="w-4 h-4" />} title="4. Pass Fulfillment &amp; Kit Delivery Policy">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Digital Pass Delivery:</strong> Immediately upon successful transaction confirmation, an official verifiable digital RPL Pass featuring your Player ID, Unique Transaction Reference (UTR), and barcode/QR verification is generated on-screen for download and printing. Digital passes are also accessible anytime via the "Check Pass" portal using your registered mobile number.</li>
              <li><strong>Physical Kit Distribution:</strong> Customized tournament kits (jerseys, badges, accreditation tags) are <strong>not dispatched via courier</strong>. They are presented in person to the registered participant at the Tournament Helpdesk at Shrimad Rajchandra Aatma Tatva Research Centre during check-in on December 25, 2026.</li>
            </ul>
          </Section>

          {/* 5. Research Centre Stay & Decorum */}
          <Section icon={<Building2 className="w-4 h-4" />} title="5. Shrimad Rajchandra Aatma Tatva Research Centre Hospitality &amp; Code of Conduct">
            <p>The Raj Premier League is hosted at the spiritual and peaceful sanctuary of Shrimad Rajchandra Aatma Tatva Research Centre. All attendees must respect Research Centre guidelines:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Tournament Stay (Dec 25–27):</strong> 2 nights of accommodation are arranged as part of the official registration.</li>
              <li><strong>Extended Stay (Pre/Post Tournament):</strong> Stays requested prior to Dec 25 or after Dec 27 are created in <strong>Waitlist</strong> status and subject to room availability managed by the Shrimad Rajchandra Aatma Tatva Research Centre office. Participants will be notified via WhatsApp when confirmed.</li>
              <li><strong>Research Centre Sanctity:</strong> The Research Centre is a strictly vegetarian, alcohol-free, non-smoking, and tobacco-free spiritual environment. Modest clothing and respectful decorum are mandatory across all sports arenas and living quarters.</li>
              <li><strong>Sportsmanship:</strong> Sledging, abusive language, violence, or unsporting conduct will lead to immediate disqualification and removal from the Research Centre premises.</li>
            </ul>
          </Section>

          {/* 6. Health & Liability Disclaimer */}
          <Section icon={<AlertCircle className="w-4 h-4" />} title="6. Health, Safety &amp; Physical Liability">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Participation in athletic sports involves inherent physical exertion. Participants voluntarily compete at their own risk.</li>
              <li>You confirm that you are medically fit to engage in strenuous sports activities.</li>
              <li>First-aid and immediate emergency medical support will be accessible on the Research Centre premises during tournament hours. RPL and Shrimad Rajchandra Aatma Tatva Research Centre bear no liability for pre-existing medical conditions, sports injuries, or personal property loss.</li>
            </ul>
          </Section>

          {/* 7. Media & Publicity Rights */}
          <Section icon={<Camera className="w-4 h-4" />} title="7. Media, Photography &amp; Video Rights">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>By participating in RPL, you grant the organizing committee permission to capture photographs and videos of matches, ceremonies, and celebrations.</li>
              <li>Such content may be utilized on official non-commercial channels (YouTube, Instagram, community broadcasts) for event reporting and sports promotion.</li>
            </ul>
          </Section>

          {/* 8. Contact Information & Grievance Redressal */}
          <Section icon={<MapPin className="w-4 h-4" />} title="8. Contact Information &amp; Grievance Redressal">
            <p>For questions regarding registrations, cancellations, refunds, or tournament logistics, please contact our administrative desk:</p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p><strong>Organizing Body:</strong> Raj Premier League (RPL) Committee</p>
              <p><strong>Host Institution:</strong> Shrimad Rajchandra Aatma Tatva Research Centre</p>
              <p><strong>Contact Helpline:</strong> <a href="tel:+919321001499" className="text-amber-600 font-semibold hover:underline">+91 9321001499</a></p>
              <p><strong>Official Email:</strong> <a href="mailto:info.rplevents@gmail.com" className="text-amber-600 font-semibold hover:underline">info.rplevents@gmail.com</a></p>
              <p><strong>Research Centre Address:</strong> Raj Nagar, Parli, Post Gothavade, Taluka Sudhagad, Off Khopoli-Pali Road, Dist. Raigad - 410205, Maharashtra, India.</p>
              <p><strong>Support Resolution Time:</strong> Within 24–48 working hours.</p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;
