import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UserProfile, PostReport } from '../../types';
import { ChurchFeedStore } from '../../services/churchFeedStore';

interface ReportPostModalProps {
  reportInfo: {
    postId: string;
    commentId?: string | null;
    authorName?: string;
  } | null;
  currentUser: UserProfile;
  onClose: () => void;
}

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  reportInfo,
  currentUser,
  onClose
}) => {
  const [reason, setReason] = useState<PostReport['reason']>('inappropriate_language');
  const [detailText, setDetailText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!reportInfo) return null;

  const REASONS: Array<{ id: PostReport['reason']; title: string; desc: string }> = [
    {
      id: 'inappropriate_language',
      title: 'Inappropriate or Offensive Language',
      desc: 'Contains profanity, vulgarity, or unwholesome speech not fitting for saints.'
    },
    {
      id: 'false_doctrine',
      title: 'False Doctrine or Disrespectful',
      desc: 'Contradicts Christian scripture or disrespects church leadership and members.'
    },
    {
      id: 'harassment',
      title: 'Harassment, Bullying, or Hostility',
      desc: 'Attacks, demeans, or harasses a specific brother or sister in Christ.'
    },
    {
      id: 'spam_advertising',
      title: 'Spam or Commercial Advertising',
      desc: 'Promotes unauthorized products, scams, or repeated unsolicited links.'
    },
    {
      id: 'other',
      title: 'Other Issue',
      desc: 'Another concern requiring pastoral review.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ChurchFeedStore.reportPost(
      reportInfo.postId,
      currentUser,
      reason,
      detailText,
      reportInfo.commentId
    );
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
              Report Submitted
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              Thank you for keeping our church community wholesome. Church leadership will review this promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>Report {reportInfo.commentId ? 'Comment' : 'Community Post'}</span>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Please help our pastors and moderators understand why this content from{' '}
              <strong className="text-stone-900 dark:text-white">{reportInfo.authorName || 'this member'}</strong> is inappropriate:
            </p>

            {/* Reason Radio Options */}
            <div className="space-y-2">
              {REASONS.map(r => (
                <label 
                  key={r.id}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                    reason === r.id
                      ? 'border-gold bg-gold/5 dark:bg-gold/10'
                      : 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-1 text-gold focus:ring-gold"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white">
                      {r.title}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional details */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Provide any context that would help church leadership..."
                value={detailText}
                onChange={(e) => setDetailText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Submit Report to Admins
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
