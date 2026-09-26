'use client';

import React from 'react';
import {
  History,
  Eye,
  Shield,
  User,
  Globe,
  Database,
  Clock,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatRelativeTime } from '@/lib/format';
import type { AuditLog } from '@/types/auditLog';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  onSelectLog: (log: AuditLog) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  onSelectLog,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3 shadow-2xs"
        data-testid="audit-empty-state"
      >
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          No Audit Records Found
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          No administrative logs match your current filter parameters. Try clearing action or date filters.
        </p>
      </div>
    );
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban') || action.includes('deactivate')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('resolve') || action.includes('restore') || action.includes('verify')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('override') || action.includes('feature')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden"
      data-testid="audit-log-table"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50/80 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Admin Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logs.map((item) => {
              const admin = typeof item.adminId === 'object' && item.adminId ? item.adminId : null;
              const adminName = admin?.displayName || 'System Administrator';
              const adminEmail = admin?.email;
              const badgeClass = getActionBadgeColor(item.action);

              return (
                <tr
                  key={item._id}
                  data-testid={`audit-row-${item._id}`}
                  onClick={() => onSelectLog(item)}
                  className="hover:bg-orange-50/20 transition cursor-pointer group"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-xs">
                      {formatRelativeTime(item.createdAt)}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {formatDate(item.createdAt)}
                    </div>
                  </td>

                  {/* Admin Actor */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0 max-w-[180px]">
                      <div className="font-semibold text-slate-800 text-xs truncate flex items-center gap-1.5">
                        <User className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{adminName}</span>
                      </div>
                      {adminEmail && (
                        <div className="text-[10px] text-stone-400 truncate">
                          {adminEmail}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border ${badgeClass}`}
                    >
                      {item.action}
                    </span>
                  </td>

                  {/* Target Resource */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                      <Database className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{item.targetType}</span>
                      {item.targetId && (
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded max-w-[120px] truncate" title={String(item.targetId)}>
                          {String(item.targetId)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* IP Address */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>{item.ipAddress || 'Internal'}</span>
                    </div>
                  </td>

                  {/* Details Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(item);
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                      title="Inspect Log Entry"
                      data-testid={`inspect-log-btn-${item._id}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                      <span>Inspect</span>
                    </button>
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
