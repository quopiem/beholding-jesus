import React, { useState } from 'react';
import { 
  MapPin, ExternalLink, Copy, Check, Send, 
  Clock, ShieldCheck, Mail, Phone, Compass, CheckCircle2 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicContactPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicContactPage: React.FC<PublicContactPageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  const { contact } = PUBLIC_CHURCH_DATA;
  const [copied, setCopied] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('General Inquiry');
  const [formMessage, setFormMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.sanctuaryAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) return;
    setIsSent(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge="Find Us in Bacoor City"
        title="Contact & Sanctuary Location"
        subtitle="We would love to connect with you. Visit us in person or send an inquiry to our church office."
        onNavigateHome={() => onNavigate('home')}
      />

      {/* Main Location & Address Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-100 dark:border-slate-800">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span>Sanctuary Address</span>
              </div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Visit Us in Cavite
              </h2>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 font-sans leading-relaxed">
                {contact.sanctuaryAddress}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                {contact.landmarks}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-gold text-stone-700 dark:text-stone-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
                <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
              </button>

              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Sanctuary Amenities */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-gold">
              Sanctuary Facilities & Amenities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {contact.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Commute Guide */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            How to Get Here
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Commute & Driving Directions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contact.commuteDirections.map((dir, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-2.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                {dir.from}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                {dir.steps}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/40 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
              Get In Touch
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
              Send a Message to Our Ministry Team
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Have questions about church services, pastoral counseling, or Life Groups? We are here to help.
            </p>
          </div>

          {isSent ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-serif font-bold text-lg text-white">
                Message Sent Successfully
              </h4>
              <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                Thank you, {formName || 'friend'}! Our church office has received your inquiry. We will reach back out to you shortly. God bless you!
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setFormMessage('');
                }}
                className="mt-2 text-xs font-bold text-gold underline cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Full Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Email Address or Phone <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. email@example.com or phone"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                  Subject / Topic
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-white/20 text-white text-xs focus:outline-hidden focus:border-gold"
                >
                  <option value="General Inquiry">General Church Inquiry</option>
                  <option value="First Time Visit">First Time Visit Questions</option>
                  <option value="Life Groups">Joining a Life Group in Cavite</option>
                  <option value="Water Baptism">Water Baptism & Dedication</option>
                  <option value="Pastoral Care">Pastoral Counseling & Care</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                  Your Message <span className="text-gold">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="How can we assist you or pray with you?"
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send Message to Church Office</span>
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
