'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { TrustRibbon } from '@/components/layout/TrustRibbon';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafaf9] text-[#1e293b]">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Badge variant="success" dot>
              v0.1 Foundation
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Preview Modal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Direct Homeowner Rentals • Zero Broker Fees</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Find your next home in <span className="text-orange-600">Addis Ababa</span>.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-medium">
            Kiray connects renters directly with verified property owners. Transparent pricing,
            accurate neighborhood maps, and honest tenant reviews.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search apartments in Bole, Kazanchis, CMC..."
              leftIcon={<Search className="w-4 h-4" />}
              className="max-w-md shadow-xs"
            />
            <Button variant="primary">Search</Button>
          </div>

          {selectedNeighborhood && (
            <p className="text-xs text-orange-600 font-semibold">
              Filter selected: {selectedNeighborhood}
            </p>
          )}
        </div>

        {/* UI Primitives Showcase */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Foundation UI Primitives
            </h2>
            <p className="text-xs text-stone-500">
              Validated reusable tokens and components matching Kiray design system
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Buttons &amp; Badges
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="ghost" size="sm">Ghost</Button>
              <Button variant="danger" size="sm">Danger</Button>
              <Button variant="primary" size="sm" isLoading>Loading</Button>

              <Badge variant="default">Default</Badge>
              <Badge variant="success" dot>Available</Badge>
              <Badge variant="warning" dot>Pending</Badge>
              <Badge variant="danger">Banned</Badge>
              <Badge variant="info">Featured</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Formatter Utility Test
            </div>
            <div className="text-xs font-mono text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200 inline-block">
              {formatPrice(35000)} • 120 m² • Bole Atlas
            </div>
          </div>
        </section>
      </main>

      {/* Trust Ribbon */}
      <TrustRibbon />

      {/* Footer */}
      <Footer onNeighborhoodClick={(n) => setSelectedNeighborhood(n)} />

      {/* Dialog Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Kiray Foundation Shell"
        description="This modal validates the accessible dialog shell primitive."
      >
        <div className="space-y-4 text-sm text-stone-600">
          <p>
            All foundation components, design tokens, Google Fonts, and RTK Query primitives are
            configured and verified.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
