'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatETB } from '@/lib/format';
import type { FlaggedListing } from '@/types/admin';

interface FlaggedQueueTableProps {
  listings: FlaggedListing[];
  isLoading?: boolean;
  onInspectReports: (listing: FlaggedListing) => void;
  onResolveFlags: (listing: FlaggedListing) => void;
}

export const FlaggedQueueTable: React.FC<FlaggedQueueTableProps> = ({
  listings,
  isLoading,
  onInspectReports,
  onResolveFlags,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div
        className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3 shadow-2xs"
        data-testid="flagged-empty-state"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          Moderation Queue is Clean!
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          No rental listings currently flagged for terms violations, illegal broker fees, or incorrect locations.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden"
      data-testid="flagged-queue-table"
    >
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50/80 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <th className="py-3 px-4">Listing &amp; Location</th>
              <th className="py-3 px-4">Owner / Landlord</th>
              <th className="py-3 px-4">Flag Reason</th>
              <th className="py-3 px-4 text-center">Pending Reports</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {listings.map((item) => {
              const thumbnail = item.images?.[0]?.url;
              const neighborhood =
                item.address?.neighborhood || item.address?.city || 'Addis Ababa';
              const ownerName = item.ownerId?.displayName || 'Unknown Landlord';
              const ownerEmail = item.ownerId?.email;

              return (
                <tr
                  key={item._id}
                  data-testid={`flagged-row-${item._id}`}
                  className="hover:bg-orange-50/20 transition group"
                >
                  {/* Listing & Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                          <Building className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs truncate group-hover:text-orange-600 transition">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {neighborhood} • {formatETB(item.price)}/mo
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0 max-w-[180px]">
                      <div className="font-semibold text-slate-800 text-xs truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>{ownerName}</span>
                      </div>
                      {ownerEmail && (
                        <div className="text-[10px] text-stone-400 truncate">
                          {ownerEmail}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Flag Reason */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0 max-w-[220px]">
                      {item.flagReason ? (
                        <span className="text-[11px] text-rose-800 font-medium bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 line-clamp-1">
                          {item.flagReason}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500 italic">
                          Community reported
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Pending Reports Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      data-testid={`pending-reports-badge-${item._id}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                        item.pendingReportCount > 0
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{item.pendingReportCount}</span>
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'rented'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Moderation Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Inspect User Reports */}
                      <button
                        onClick={() => onInspectReports(item)}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                        title="Inspect User Complaints &amp; History"
                        data-testid={`inspect-reports-btn-${item._id}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Reports</span>
                      </button>

                      {/* Resolve Flags Modal */}
                      <button
                        onClick={() => onResolveFlags(item)}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                        title="Resolve Safety Flags"
                        data-testid={`resolve-flags-btn-${item._id}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>

                      {/* Live Link */}
                      {item.slug && (
                        <Link
                          href={`/listings/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition"
                          title="Open live listing in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
