import { useState } from 'react';
import {
  Building2,
  PieChart,
  TrendingUp,
  Sparkles,
  Users,
  ShoppingBag,
  Coins,
  CheckCircle2,
  Factory,
  Cpu,
  Zap,
} from 'lucide-react';
import { soundFX } from '../../utils/audio';

// =========================================================================
// SECTION 1: WHAT IS A COMPANY?
// =========================================================================
function SectionWhatIsACompany() {
  const [activePillar, setActivePillar] = useState('products');

  const pillars = [
    {
      id: 'products',
      title: 'Products & Services',
      icon: ShoppingBag,
      summary: 'Making goods people need and love.',
      details:
        'A company creates valuable things — like TechNova writing smart trading software, GreenEnergy manufacturing solar panels, or FoodSphere baking organic breads.',
      color: 'sky',
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: Users,
      summary: 'The people & businesses who buy.',
      details:
        'Without customers, a business cannot survive. Customers happily pay money in exchange for products and services that solve their daily problems.',
      color: 'emerald',
    },
    {
      id: 'employees',
      title: 'Teams & Talent',
      icon: Building2,
      summary: 'Engineers, designers, managers.',
      details:
        'Employees combine their skills to invent, build, market, and distribute the company’s offerings while earning salaries.',
      color: 'amber',
    },
    {
      id: 'revenue',
      title: 'Revenue & Profits',
      icon: Coins,
      summary: 'Income that powers growth.',
      details:
        'When customer sales exceed operating expenses, the company earns a profit. Profits can be saved, paid to shareholders as dividends, or reinvested to expand.',
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Core Explanation */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-sky-400/30">
        <h4 className="text-base sm:text-lg font-bold text-white font-heading mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-400" />
          <span>An Organization Created to Deliver Value</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          At its simplest, a <strong className="text-sky-300">company</strong> is an organized group of people working together to provide <strong className="text-emerald-300">products</strong> (physical goods like phones or food) or <strong className="text-amber-300">services</strong> (like apps, healthcare, or electricity) to customers in exchange for money.
        </p>
      </div>

      {/* Interactive 4 Pillars */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Explore the 4 Pillars of Every Company (Click Each)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {pillars.map((p) => {
            const Icon = p.icon;
            const isSelected = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  soundFX.playClick();
                  setActivePillar(p.id);
                }}
                className={`p-3 sm:p-3.5 rounded-2xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'glass-panel-glow border-sky-400 bg-sky-950/60 shadow-lg shadow-sky-500/20 scale-[1.02]'
                    : 'glass-panel border-slate-700/60 hover:border-slate-500 hover:bg-slate-900/60'
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 w-fit ${isSelected ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white font-heading line-clamp-1">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{p.summary}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Detail Card */}
        {activePillar && (
          <div className="mt-3.5 p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-300 block mb-1">
                  How it works in Stock Market City:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pillars.find((p) => p.id === activePillar)?.details}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Examples in City */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Fictional City Examples:</span>
        </span>
        <span className="text-white font-semibold">
          TechNova (Tech) • GreenEnergy (Solar/Wind) • FoodSphere (Groceries)
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 2: WHAT IS A SHARE? (Interactive Ownership Visualizer)
// =========================================================================
function SectionWhatIsAShare() {
  const [sharesOwned, setSharesOwned] = useState(5000);
  const totalCompanyShares = 100000;
  const pricePerShare = 10;
  const ownershipPercentage = ((sharesOwned / totalCompanyShares) * 100).toFixed(1);
  const totalStakeValue = (sharesOwned * pricePerShare).toLocaleString('en-IN');

  const handleSliderChange = (e) => {
    setSharesOwned(Number(e.target.value));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Core Explanation */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-emerald-400/30">
        <h4 className="text-base sm:text-lg font-bold text-white font-heading mb-2 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-400" />
          <span>A Share is a Unit of Ownership</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When a company becomes large, its ownership is divided into millions of tiny equal slices called <strong className="text-emerald-300">shares</strong> or <strong className="text-sky-300">stocks</strong>. If you buy even a single share, you become a <strong className="text-white">shareholder</strong> — meaning you legally own a piece of that business!
        </p>
      </div>

      {/* Interactive Pizza / Cake of Ownership Simulator */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Interactive Ownership Simulator
            </div>
            <div className="text-sm font-extrabold text-white font-heading">
              TechNova Corporation (1,00,000 Total Shares)
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-numbers text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
              Ownership: {ownershipPercentage}%
            </span>
          </div>
        </div>

        {/* Visual Ownership Bar / Pie Representation */}
        <div className="relative mb-6">
          {/* Visual Track */}
          <div className="h-8 w-full rounded-xl bg-slate-800/80 overflow-hidden border border-slate-700 flex shadow-inner">
            {/* User Owned Portion */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-150 flex items-center justify-center text-[10px] font-black text-slate-950 font-mono-numbers shadow-lg"
              style={{ width: `${Math.max(ownershipPercentage, 3)}%` }}
            >
              {ownershipPercentage >= 8 ? `${ownershipPercentage}% YOU` : ''}
            </div>
            {/* Remaining Other Shareholders */}
            <div className="flex-1 flex items-center justify-end pr-3 text-[10px] text-slate-400 font-medium">
              {(100 - ownershipPercentage).toFixed(1)}% Other Public Shareholders
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono-numbers">
            <span>0 Shares (0%)</span>
            <span>50,000 Shares (50%)</span>
            <span>1,00,000 Shares (100%)</span>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Adjust Your Shares:</span>
            <span className="text-white font-bold font-mono-numbers">
              {sharesOwned.toLocaleString('en-IN')} Shares
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={sharesOwned}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Real-time Calculation Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-800 text-center font-mono-numbers">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Total Shares Owned</div>
            <div className="text-sm font-bold text-white mt-0.5">{sharesOwned.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Your Company Stake</div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">{ownershipPercentage}%</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Your Share Value</div>
            <div className="text-sm font-bold text-sky-300 mt-0.5">₹{totalStakeValue}</div>
          </div>
        </div>
      </div>

      {/* Student Takeaway */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Key Rule:</strong> If TechNova doubles its annual profits or invents groundbreaking technology, the value of each share rises — meaning your ₹{totalStakeValue} investment grows!
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 3: WHY DO COMPANIES ISSUE SHARES?
// =========================================================================
function SectionWhyIssueShares() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: '1. Big Ambitious Vision',
      icon: Cpu,
      summary: 'TechNova wants to build a nationwide quantum AI data grid, but needs ₹500 Crore to build it.',
    },
    {
      step: 2,
      title: '2. Selling Shares (Raising Capital)',
      icon: Coins,
      summary: 'Instead of taking massive bank loans with high interest, they sell 10,00,000 shares to the public for ₹5,000 each.',
    },
    {
      step: 3,
      title: '3. Building & Expanding',
      icon: Factory,
      summary: 'With ₹500 Cr raised, TechNova builds clean energy facilities, hires 500 engineers, and launches its product.',
    },
    {
      step: 4,
      title: '4. Shared Prosperity',
      icon: TrendingUp,
      summary: 'The business flourishes! Millions use the app, profits soar, and shareholders watch their share price double.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Core Explanation */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-orange-400/30">
        <h4 className="text-base sm:text-lg font-bold text-white font-heading mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <span>Raising Capital to Grow and Expand</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Building massive factories, designing satellites, or inventing life-saving medicines requires enormous amounts of money (<strong className="text-amber-300">Capital</strong>). By issuing shares, companies allow everyday people to invest and share in their future success without taking debt!
        </p>
      </div>

      {/* Interactive 4-Step Capital Engine */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          The Capital Growth Engine (Click Steps 1-4)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  soundFX.playClick();
                  setActiveStep(s.step);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'glass-panel-glow border-orange-400 bg-orange-950/40 shadow-lg shadow-orange-500/20 scale-[1.02]'
                    : 'glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${isCurrent ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-white font-heading">{s.title}</div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {s.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why not just a bank loan? */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Why not just borrow from a bank?</span>
        </h5>
        <p className="text-xs text-slate-300 leading-relaxed">
          Bank loans must be repaid every month with high interest, even if a new invention takes 3 years to work! By selling shares, investors become partners: they only earn when the company earns, giving the founders breathing room to innovate.
        </p>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN CONTAINER DISPATCHER
// =========================================================================
export default function LearningSection({ sectionIndex }) {
  if (sectionIndex === 0) return <SectionWhatIsACompany />;
  if (sectionIndex === 1) return <SectionWhatIsAShare />;
  if (sectionIndex === 2) return <SectionWhyIssueShares />;
  return null;
}
