import { useState } from 'react';
import HeroSlides from './HeroSlides';
import HomepageSections from './HomepageSections';

const StorefrontManager = () => {
  const [activeTab, setActiveTab] = useState('hero-slides');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--ink)] tracking-tight">Storefront Setup</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Manage the layout and dynamic sections of your landing page.</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border-b border-[var(--border)] mb-6 flex space-x-6 overflow-x-auto">
        <button
          className={`h-[40px] px-2 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hero-slides' 
              ? 'border-[var(--ink)] text-[var(--ink)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveTab('hero-slides')}
        >
          Hero Banner Slides
        </button>
        <button
          className={`h-[40px] px-2 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'homepage-sections' 
              ? 'border-[var(--ink)] text-[var(--ink)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--ink)]'
          }`}
          onClick={() => setActiveTab('homepage-sections')}
        >
          Dynamic Homepage Sections
        </button>
      </div>

      <div className="flex-1 w-full bg-white relative">
        {activeTab === 'hero-slides' && (
          <div className="animate-in fade-in">
            <HeroSlides />
          </div>
        )}
        {activeTab === 'homepage-sections' && (
          <div className="animate-in fade-in">
            <HomepageSections />
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontManager;
