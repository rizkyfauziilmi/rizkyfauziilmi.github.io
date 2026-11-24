import { Power } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HaltedScreenProps {
  onPowerOn: () => void;
}

export function HaltedScreen({ onPowerOn }: HaltedScreenProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-black py-16 text-center font-mono text-green-400">
      <p className="text-lg tracking-widest">SYSTEM HALTED</p>
      <p className="text-sm text-green-400/70">
        The terminal has been powered off.
      </p>
      <Button variant="halted" size="sm" onClick={onPowerOn}>
        <Power /> Power on
      </Button>
    </div>
  );
}
