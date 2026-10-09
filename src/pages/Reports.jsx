import { TrendingUp, Users, ShoppingCart, Activity, MousePointerClick, Smartphone, Monitor, Map, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchAnalytics = async () => {
  // In a production backend, this would hit an aggregation pipeline endpoint.
  // For now, we mock the telemetry dashboard.
  return new Promise(resolve => setTimeout(() => resolve({
    revenue: { current: 1245000, previous: 980000, growth: 27 },
    visitors: { current: 45200, previous: 38000, growth: 18.9 },
    conversion: { current: 2.8, previous: 2.4, growth: 16.6 },
    aov: { current: 1850, previous: 1720, growth: 7.5 },
    trafficSources: [
      { source: 'Instagram (Organic)', percentage: 45 },
      { source: 'Google Ads', percentage: 25 },
      { source: 'Direct', percentage: 20 },
      { source: 'Referral', percentage: 10 },
    ],
    deviceSplit: { mobile: 78, desktop: 22 },
    topLocations: [
      { state: 'Maharashtra', percentage: 35 },
      { state: 'Delhi NCR', percentage: 25 },
      { state: 'Karnataka', percentage: 15 },
      { state: 'Gujarat', percentage: 10 },
    ]
  }), 800));
};

const Reports = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading || !metrics) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Analytics & Intelligence</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Macro growth metrics, conversion telemetry, and audience demographics.</p>
        </div>
        <div className="flex gap-2">
          <select className="h-10 px-3 border border-[var(--border)] bg-[var(--surface)] text-[13px] font-semibold text-[var(--text-secondary)] focus:outline-none focus:border-[var(--ink)] cursor-pointer">
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
      </div>

      {/* TOP KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(metrics.revenue.current), growth: metrics.revenue.growth, icon: TrendingUp },
          { label: 'Unique Visitors', value: metrics.visitors.current.toLocaleString(), growth: metrics.visitors.growth, icon: Users },
          { label: 'Conversion Rate', value: `${metrics.conversion.current}%`, growth: metrics.conversion.growth, icon: MousePointerClick },
          { label: 'Average Order Value', value: formatCurrency(metrics.aov.current), growth: metrics.aov.growth, icon: ShoppingCart }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth > 0;
          return (
            <div key={idx} className="bg-[var(--surface)] border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</div>
                <Icon size={16} className="text-[var(--text-secondary)]" />
              </div>
              <div className="text-[28px] font-bold text-[var(--ink)] tracking-tight mb-2 table-num">{kpi.value}</div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(kpi.growth)}%
                </span>
                <span className="text-[12px] text-[var(--text-secondary)]">vs previous period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* SECONDARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TRAFFIC SOURCES */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/30">
            <h3 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#3395FF]" /> Acquisition Channels
            </h3>
          </div>
          <div className="flex-1 p-5 lg:p-8 flex flex-col justify-center">
            <div className="space-y-6">
              {metrics.trafficSources.map(source => (
                <div key={source.source}>
                  <div className="flex justify-between text-[13px] font-semibold text-[var(--ink)] mb-2">
                    <span>{source.source}</span>
                    <span className="table-num">{source.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--ink)] transition-all duration-1000 ease-out" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DEMOGRAPHICS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* DEVICE SPLIT */}
          <div className="bg-[var(--surface)] border border-[var(--border)]">
             <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/30">
              <h3 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider">Device Split</h3>
             </div>
             <div className="p-6">
               <div className="flex items-center gap-6 mb-4">
                 <div className="w-16 h-16 rounded-full border-[6px] border-[var(--ink)] flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-[6px] border-[var(--border)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)'}}></div>
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1.5">
                     <Smartphone size={14} className="text-[var(--text-secondary)]" />
                     <span className="text-[13px] font-bold text-[var(--ink)]">{metrics.deviceSplit.mobile}% Mobile</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Monitor size={14} className="text-[var(--text-muted)]" />
                     <span className="text-[13px] font-semibold text-[var(--text-secondary)]">{metrics.deviceSplit.desktop}% Desktop</span>
                   </div>
                 </div>
               </div>
               <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Ensure mobile-first image optimization as it dictates the vast majority of your traffic.</p>
             </div>
          </div>

          {/* TOP GEOs */}
          <div className="bg-[var(--surface)] border border-[var(--border)]">
             <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/30 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-2">
                <Map size={16} /> Top Regions
              </h3>
             </div>
             <div className="p-0">
               <ul className="divide-y divide-[var(--border)]">
                 {metrics.topLocations.map((loc, i) => (
                   <li key={i} className="flex justify-between items-center p-4">
                     <span className="text-[13px] font-semibold text-[var(--ink)] tracking-wide">{loc.state}</span>
                     <span className="text-[12px] font-bold bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)] rounded-sm text-[var(--text-secondary)] table-num">{loc.percentage}%</span>
                   </li>
                 ))}
               </ul>
             </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Reports;
