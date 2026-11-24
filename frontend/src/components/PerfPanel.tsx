import type { SearchMetrics } from '../types';

interface Props {
  metrics: SearchMetrics | null;
  fromApi: boolean;
}

/**
 * Transparent search performance — shows exactly how each search
 * was executed: records scanned, comparisons, blocks read, and
 * the cost-model comparison (RAM ops vs blocks vs parallel steps).
 */
export default function PerfPanel({ metrics, fromApi }: Props) {
  if (!metrics) return null;
  const cm = metrics.costModel;
  const maxBar = Math.max(cm.ramOps, cm.blockTransfers * 10, cm.pramSteps * 10, 1);
  const pct = (v: number) => Math.max(3, Math.round((v / maxBar) * 100));
  return (
    <section className="perf" aria-label="Search performance">
      <div className="perf-head">
        <h2>🔍 How this search ran</h2>
        <span className={`perf-badge ${metrics.oraclePass ? 'pass' : ''}`}>
          {metrics.oraclePass ? '✓ Oracle verified' : 'Live results'} · {fromApi ? 'API' : 'On-device engine'}
        </span>
      </div>
      <div className="perf-stats">
        <div><b>{metrics.scanned}</b><span>records scanned</span></div>
        <div><b>{metrics.comparisons.toLocaleString('en-IN')}</b><span>comparisons</span></div>
        <div><b>{metrics.blocksRead}</b><span>blocks read (B={cm.blockSize})</span></div>
        <div><b>{metrics.elapsedMs} ms</b><span>response time</span></div>
        <div><b>{metrics.matchedIds.length}</b><span>matches</span></div>
      </div>
      <div className="perf-bars">
        <div className="pbar"><span>RAM ops (3N)</span><div className="track"><i style={{ width: pct(cm.ramOps) + '%', background: 'linear-gradient(90deg,#4F46E5,#7C3AED)' }} /></div><b>{cm.ramOps.toLocaleString('en-IN')}</b></div>
        <div className="pbar"><span>Blocks ⌈N/B⌉</span><div className="track"><i style={{ width: pct(cm.blockTransfers * 10) + '%', background: 'linear-gradient(90deg,#06B6D4,#22D3EE)' }} /></div><b>{cm.blockTransfers}</b></div>
        <div className="pbar"><span>PRAM steps ⌈N/p⌉</span><div className="track"><i style={{ width: pct(cm.pramSteps * 10) + '%', background: 'linear-gradient(90deg,#10B981,#34D399)' }} /></div><b>{cm.pramSteps}</b></div>
        <div className="pbar"><span>Work / Span</span><div className="track"><i style={{ width: pct(cm.work) + '%', background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }} /></div><b>{cm.work} / {cm.span}</b></div>
      </div>
      <p className="perf-note">
        Exact linear scan with sequential layout. Same operation count can still mean different
        real-world time — block transfers and memory layout decide that. Scattered access would
        read up to <b>{cm.work} blocks</b> instead of <b>{cm.blockTransfers}</b>.
      </p>
    </section>
  );
}
