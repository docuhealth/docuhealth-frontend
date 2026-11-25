import {
  BarbellIcon,
  DropIcon,
  GaugeIcon,
  HeartIcon,
  PulseIcon,
  RulerIcon,
  ThermometerSimpleIcon,
  WindIcon,
} from "@phosphor-icons/react";
import type { VitalKey } from "@/features/patient/lib/vitals";

const icons = {
  bloodPressure: HeartIcon,
  heartRate: PulseIcon,
  temperature: ThermometerSimpleIcon,
  spo2: DropIcon,
  weight: BarbellIcon,
  bmi: GaugeIcon,
  height: RulerIcon,
  breathingRate: WindIcon,
} satisfies Record<VitalKey, unknown>;

/** A vital sign's small icon, as on its tile. */
export function VitalIcon({ vital, className }: { vital: VitalKey; className?: string }) {
  const Icon = icons[vital];
  return <Icon className={className} aria-hidden />;
}
