'use client';

import React, { useState } from 'react';
import type { User } from '@/types/user';
import { Phone, MessageCircle, Copy, Check, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export interface OwnerProfileCardProps {
  owner?: User | string | null;
  listingId: string;
  onContactClick?: (method: 'call' | 'whatsapp') => void;
}

export const OwnerProfileCard: React.FC<OwnerProfileCardProps> = ({
  owner,
  listingId,
  onContactClick,
}) => {
  const [copied, setCopied] = useState(false);

  // When owner is an object
  const ownerObj = typeof owner === 'object' && owner !== null ? owner : null;
  const ownerName = ownerObj?.displayName || ownerObj?.fullName || 'Property Host';
  const ownerPhone = ownerObj?.phone || (ownerObj?.phoneNumber && ownerObj.phoneNumber[0]);
  const ownerWhatsapp = ownerObj?.whatsapp || ownerPhone;
  const isVerified = ownerObj?.isVerified ?? true;
  const photoURL = ownerObj?.photoURL;
  const memberSince = ownerObj?.createdAt
    ? new Date(ownerObj.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2025';

  const handleCopyPhone = () => {
    if (ownerPhone && navigator.clipboard) {
      navigator.clipboard.writeText(ownerPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCall = () => {
    onContactClick?.('call');
  };

  const handleWhatsapp = () => {
    onContactClick?.('whatsapp');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        {photoURL ? (
          <img
            src={photoURL}
            alt={ownerName}
            className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
            {ownerName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-stone-900 text-base truncate">{ownerName}</h4>
            {isVerified && (
              <span title="Verified Landlord">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500">Property Host · Member since {memberSince}</p>
        </div>
      </div>

      {ownerObj?.bio && (
        <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-100">
          &ldquo;{ownerObj.bio}&rdquo;
        </p>
      )}

      {/* Action CTA Buttons */}
      <div className="space-y-2.5 pt-2">
        {ownerPhone ? (
          <a
            href={`tel:${ownerPhone}`}
            onClick={handleCall}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Landlord ({ownerPhone})</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 text-stone-400 rounded-xl text-sm font-semibold cursor-not-allowed"
          >
            <Phone className="w-4 h-4" />
            <span>Phone Available Upon Request</span>
          </button>
        )}

        {ownerWhatsapp && (
          <a
            href={`https://wa.me/${ownerWhatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsapp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </a>
        )}

        {ownerPhone && (
          <button
            type="button"
            onClick={handleCopyPhone}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-stone-500 hover:text-stone-800 text-xs font-medium rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Phone number copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy phone number</span>
              </>
            )}
          </button>
        )}
      </div>

      {ownerObj?._id && (
        <div className="pt-2 text-center border-t border-stone-100">
          <Link
            href={`/profile/${ownerObj._id}`}
            className="text-xs text-stone-500 hover:text-emerald-700 font-medium transition-colors"
          >
            View host&apos;s other listings →
          </Link>
        </div>
      )}
    </div>
  );
};
