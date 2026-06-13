import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Account and portfolio settings" />
      <div className="bg-[#0f172a] border border-white/8 rounded-xl p-6">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-300/80">
            <span className="font-semibold text-yellow-300">Simulation disclaimer:</span> This is a
            paper trading game. All trades use simulated money and do not represent real investments.
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-white/8">
          <p className="text-gray-400 text-sm">Reset portfolio option coming in Phase 5.</p>
        </div>
      </div>
    </div>
  );
}
