'use client';

import React, { useState, useMemo } from 'react';
import type { Listing } from '@/types/listing';
import type { User } from '@/types/user';
import type {
  ActivityAnalyticsPeriod,
  AdminListingPropertyTypeMetric,
} from '@/types/admin';
import { useGetActivityAnalyticsQuery } from '../adminDashboardApi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Filter,
  Sparkles,
  PieChart as PieIcon,
  Users,
  Activity,
  Loader2,
  Inbox,
} from 'lucide-react';

export type AnalyticsFilter = 'all' | 'activity' | 'inventory' | 'growth';

interface AdminAnalyticsProps {
  propertyTypes?: AdminListingPropertyTypeMetric[];
  listings?: Listing[];
  users?: User[];
  activeFilter?: AnalyticsFilter;
  hideFilterPills?: boolean;
}

const DONUT_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

// Helper to generate past N months with YYYY-MM keys and readable labels
function generateMonthTimeline(monthCount: number) {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const label = d.toLocaleDateString(undefined, { month: 'short' });
    result.push({ key, label });
  }
  return result;
}

// Helper to generate past N days with YYYY-MM-DD keys and readable labels
function generateDayTimeline(dayCount: number) {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    result.push({ key, label });
  }
  return result;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  propertyTypes,
  listings = [],
  users = [],
  activeFilter,
  hideFilterPills = false,
}) => {
  const [timeRange, setTimeRange] = useState<ActivityAnalyticsPeriod>('30d');
  const [growthRange, setGrowthRange] = useState<ActivityAnalyticsPeriod>('30d');
  const [internalFilter, setInternalFilter] = useState<AnalyticsFilter>('all');
  const currentFilter = activeFilter || internalFilter;

  // Real-time backend activity analytics for Platform Activity chart
  const { data: activityData, isLoading: isActivityLoading } = useGetActivityAnalyticsQuery({
    period: timeRange,
  });

  // Real-time backend growth analytics for Community Growth chart (defaults to 30d for 1M report)
  const { data: growthAnalytics, isLoading: isGrowthLoading } = useGetActivityAnalyticsQuery({
    period: growthRange,
  });

  // Combine real user signups & listing creations by date for Platform Activity AreaChart
  const timeSeriesData = useMemo(() => {
    const signupLookup = new Map<string, number>();
    activityData?.userSignups?.forEach((item) => {
      signupLookup.set(item.date, item.count ?? 0);
    });

    const listingLookup = new Map<string, number>();
    activityData?.listingCreations?.forEach((item) => {
      listingLookup.set(item.date, item.count ?? 0);
    });

    let timeline: { key: string; label: string }[] = [];
    if (timeRange === '7d') {
      timeline = generateDayTimeline(7);
    } else if (timeRange === '30d') {
      timeline = generateDayTimeline(30);
    } else if (timeRange === '90d') {
      timeline = generateDayTimeline(90);
    } else if (timeRange === '6m') {
      timeline = generateMonthTimeline(6);
    } else if (timeRange === '1y') {
      timeline = generateMonthTimeline(12);
    } else {
      timeline = generateDayTimeline(30);
    }

    return timeline.map(({ key, label }) => ({
      label,
      userSignups: signupLookup.get(key) || 0,
      listingCreations: listingLookup.get(key) || 0,
    }));
  }, [activityData, timeRange]);

  // Property types breakdown from real backend aggregation or active listings
  const propertyTypeData = useMemo(() => {
    if (propertyTypes && propertyTypes.length > 0) {
      const filtered = propertyTypes.filter((item) => item.count > 0);
      if (filtered.length > 0) {
        const total = filtered.reduce((acc, curr) => acc + curr.count, 0);
        return filtered
          .map((item) => ({
            name: item.propertyType.charAt(0).toUpperCase() + item.propertyType.slice(1),
            rawType: item.propertyType,
            value: item.count,
            active: item.active,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
          }))
          .sort((a, b) => b.value - a.value);
      }
    }

    if (listings && listings.length > 0) {
      const counts: Record<string, number> = {};
      listings.forEach((l) => {
        const type = l.propertyType || 'other';
        counts[type] = (counts[type] || 0) + 1;
      });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      if (total > 0) {
        return Object.entries(counts)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            rawType: name,
            value,
            percentage: Math.round((value / total) * 100),
          }))
          .sort((a, b) => b.value - a.value);
      }
    }

    return [];
  }, [propertyTypes, listings]);

  // Community growth breakdown (Rent Seekers vs Landlords) with 1M (30d) / 6M / 1Y selection
  const userGrowthData = useMemo(() => {
    const lookup = new Map<string, { seekers: number; landlords: number; total: number }>();
    if (growthAnalytics?.userSignups) {
      growthAnalytics.userSignups.forEach((item) => {
        lookup.set(item.date, {
          seekers: item.seekers ?? item.rentees ?? 0,
          landlords: item.landlords ?? 0,
          total: item.count ?? 0,
        });
      });
    }

    let timeline: { key: string; label: string }[] = [];
    if (growthRange === '6m') {
      timeline = generateMonthTimeline(6);
    } else if (growthRange === '1y') {
      timeline = generateMonthTimeline(12);
    } else {
      // 30d (1M report)
      timeline = generateDayTimeline(30);
    }

    return timeline.map(({ key, label }) => {
      const match = lookup.get(key);
      return {
        period: label,
        seekers: match ? match.seekers : 0,
        landlords: match ? match.landlords : 0,
        total: match ? match.total : 0,
      };
    });
  }, [growthAnalytics, growthRange]);

  const totalGrowthSignups = useMemo(() => {
    return userGrowthData.reduce((acc, curr) => acc + curr.total, 0);
  }, [userGrowthData]);

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="font-semibold flex items-center justify-between gap-4"
            >
              <span>{entry.name}:</span>
              <span className="font-mono font-bold">
                {Number(entry.value).toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8" data-testid="admin-analytics">
      {/* FILTER PILLS FOR CHART SECTIONS */}
      {!hideFilterPills && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <span className="text-stone-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Focus:
          </span>
          {[
            { id: 'all', label: 'All Charts' },
            { id: 'activity', label: 'Platform Activity', icon: Activity },
            { id: 'inventory', label: 'Property Types', icon: PieIcon },
            { id: 'growth', label: 'Community Growth', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInternalFilter(tab.id as AnalyticsFilter)}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* CHART ROW 1: PRIMARY PLATFORM ACTIVITY TRENDS (USER SIGNUPS & LISTING CREATIONS) */}
      {(currentFilter === 'all' || currentFilter === 'activity') && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/80 text-orange-800 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-orange-600" />
                <span>Demand &amp; Supply Velocity</span>
              </div>
              <h3 className="font-display font-extrabold text-slate-900 text-base sm:text-lg">
                Platform Activity &amp; Growth Trends
              </h3>
              <p className="text-xs text-stone-500">
                Tracking user registrations vs. property listings created over time
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                {(['7d', '30d', '90d', '6m', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      timeRange === range
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span className="font-semibold text-slate-700">User Signups</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  <span className="font-semibold text-slate-700">Listings Created</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2 relative">
            {isActivityLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  <span>Loading activity trends...</span>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} minTickGap={16} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="userSignups"
                  name="User Signups"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSignups)"
                />
                <Area
                  type="monotone"
                  dataKey="listingCreations"
                  name="Listings Created"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorListings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART ROW 2: PROPERTY TYPE SUPPLY INVENTORY (DONUT CHART) */}
      {(currentFilter === 'all' || currentFilter === 'inventory') && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">
                Supply by Property Type
              </h3>
              <p className="text-xs text-stone-500">
                Inventory ratio currently available on Kiray platform
              </p>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-lg self-start sm:self-auto">
              Total Categories: {propertyTypeData.length}
            </span>
          </div>

          {propertyTypeData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-stone-400 text-xs">
              <PieIcon className="w-8 h-8 mb-2 stroke-1 text-stone-300" />
              <p className="font-semibold text-stone-600">No listing inventory data yet</p>
              <p className="text-stone-400 mt-0.5">Property distribution will appear as listings are published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {propertyTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} listings`, name]}
                      contentStyle={{
                        borderRadius: '12px',
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Micro legend chips */}
              <div className="md:col-span-6 grid grid-cols-2 gap-2 text-xs">
                {propertyTypeData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHART ROW 3: COMMUNITY GROWTH VELOCITY (SEEKERS VS LANDLORDS) WITH 1M / 6M / 1Y SELECTOR */}
      {(currentFilter === 'all' || currentFilter === 'growth') && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">
                Community Growth Velocity
              </h3>
              <p className="text-xs text-stone-500">
                {growthRange === '30d'
                  ? 'Daily user acquisition report (Past 30 Days / 1 Month)'
                  : growthRange === '6m'
                  ? 'Monthly user acquisition report (Past 6 Months)'
                  : 'Monthly user acquisition report (Past 1 Year)'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Timeframe Switcher for Community Growth (1M, 6M, 1Y) */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                {[
                  { id: '30d', label: '1M' },
                  { id: '6m', label: '6M' },
                  { id: '1y', label: '1Y' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGrowthRange(item.id as ActivityAnalyticsPeriod)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      growthRange === item.id
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  totalGrowthSignups > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {totalGrowthSignups > 0 ? `+${totalGrowthSignups} registered` : '0 registered'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span className="font-semibold text-slate-700">Seekers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  <span className="font-semibold text-slate-700">Landlords</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-1 relative">
            {isGrowthLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  <span>Loading growth velocity...</span>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} minTickGap={16} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="seekers"
                  name="Rent Seekers"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="landlords"
                  name="Direct Landlords"
                  stroke="#f97316"
                  fill="#fdba74"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
