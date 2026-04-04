import { getProviderStatuses, getActiveProvider, type ProviderStatus, type ProviderHealth } from '@/lib/ai-providers';
import { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, XCircle, CheckCircle2, CircleDot } from 'lucide-react';

function healthIcon(health: ProviderHealth) {
  switch (health) {
    case 'healthy':
      return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    case 'rate_limited':
      return <AlertTriangle className="w-3 h-3 text-amber-400" />;
    case 'exhausted':
    case 'error':
      return <XCircle className="w-3 h-3 text-red-400" />;
    default:
      return <CircleDot className="w-3 h-3 text-muted-foreground/50" />;
  }
}

function healthColor(health: ProviderHealth): string {
  switch (health) {
    case 'healthy': return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30';
    case 'rate_limited': return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
    case 'exhausted':
    case 'error': return 'bg-red-400/20 text-red-300 border-red-400/30';
    default: return 'bg-muted/40 text-muted-foreground border-border/40';
  }
}

interface AIStatusBarProps {
  lastSwitchMessage?: string;
}

export function AIStatusBar({ lastSwitchMessage }: AIStatusBarProps) {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);
  const [active, setActive] = useState<ProviderStatus | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const update = () => {
      setStatuses(getProviderStatuses());
      setActive(getActiveProvider());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Active provider badge */}
      {active && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-xs font-medium text-foreground/80 hover:text-foreground transition-all duration-200 group"
        >
          <Activity className="w-3 h-3 text-primary animate-pulse" />
          <span className="hidden sm:inline">{active.name}</span>
          <span className="text-[10px] text-muted-foreground hidden md:inline">({active.model})</span>
        </button>
      )}

      {/* Provider status pills */}
      {showAll && (
        <div className="flex items-center gap-1 animate-fade-in">
          {statuses.map(s => (
            <div
              key={s.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all duration-300 ${healthColor(s.health)}`}
              title={`${s.name}: ${s.health}${s.lastError ? ` — ${s.lastError}` : ''}`}
            >
              {healthIcon(s.health)}
              <span className="hidden lg:inline">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Switch notification */}
      {lastSwitchMessage && (
        <span className="text-[10px] text-amber-400 animate-fade-in flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {lastSwitchMessage}
        </span>
      )}
    </div>
  );
}
