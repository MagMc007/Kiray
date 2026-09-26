'use client';

import React, { useEffect, useCallback, useState } from 'react';
import {
  X,
  History,
  User,
  Shield,
  Clock,
  Terminal,
  Copy,
  Check,
  Globe,
  Database,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetAuditLogDetailQuery } from '@/features/admin/auditLogs/adminAuditApi';
import { formatDate, formatRelativeTime } from '@/lib/format';

interface AuditLogDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

export const AuditLogDetailDrawer: React.FC<AuditLogDetailDrawerProps> = ({
  isOpen,
  onClose,
  logId,
}) => {
  const [copied, setCopied] = useState(false);
  const { data: log, isLoading, isError } = useGetAuditLogDetailQuery(
    logId || '',
    { skip: !logId || !isOpen }
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const admin = typeof log?.adminId === 'object' && log?.adminId ? log.adminId : null;
  const metadataString = log?.metadata
    ? JSON.stringify(log.metadata, null, 2)
    : '{}';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(metadataString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
      data-testid="audit-log-detail-drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                Audit Trail Record
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5 line-clamp-1 font-mono">
                {log?.action || 'Audit Record'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              aria-label="Close audit details"
              data-testid="close-audit-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {isLoading ? (
              <div className="space-y-4" data-testid="audit-loading-skeleton">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ) : isError || !log ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                Failed to load audit log record.
              </div>
            ) : (
              <>
                {/* Meta Overview Card */}
                <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Event Action
                    </span>
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-800 font-mono font-bold text-xs rounded-lg">
                      {log.action}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/60 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">
                        Target Resource
                      </span>
                      <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Database className="w-3.5 h-3.5 text-stone-500" />
                        {log.targetType}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">
                        Target ID
                      </span>
                      <span className="font-mono text-slate-800 text-[11px] truncate block mt-0.5" title={String(log.targetId)}>
                        {String(log.targetId || 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actor Information */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Shield className="w-3.5 h-3.5 text-orange-600" />
                    <span>Administrator Identity</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs">
                        {admin?.displayName || 'System Admin'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {admin?.email || 'admin@kiray.et'}
                      </div>
                    </div>
                    {admin?.role && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold font-mono">
                        {admin.role}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>IP: {log.ipAddress || 'Internal'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatRelativeTime(log.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Formatted Metadata JSON Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-stone-600" />
                      <span>Payload Metadata</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Copy JSON to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-500" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner max-h-80">
                    <pre data-testid="audit-metadata-json">
                      <code>{metadataString}</code>
                    </pre>
                  </div>
                </div>

                {/* Timestamp Card */}
                <div className="text-[11px] text-stone-400 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  Exact timestamp: <span className="font-mono text-stone-600 font-semibold">{formatDate(log.createdAt)} ({log.createdAt})</span>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-slate-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
