import {
  CalendarDotsIcon,
  ChatsIcon,
  EyeIcon,
  type Icon,
  ReceiptIcon,
  ShareNetworkIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import type { Power } from "@/features/patient/api/family";
import { powerInfo } from "@/features/patient/lib/family";

const icons: Record<Power, Icon> = {
  view: EyeIcon,
  book: CalendarDotsIcon,
  message: ChatsIcon,
  pay: ReceiptIcon,
  manage: UserIcon,
  share: ShareNetworkIcon,
};

/**
 * What a proxy may do, a switch per power in a card. "Add a Proxy" words them as a request
 * (`wording="ask"`); the proxy's access page words them as the access itself, with icons.
 */
export function ProxyPowerSwitches({
  powers,
  value,
  onChange,
  wording,
}: {
  powers: readonly Power[];
  value: Power[];
  onChange: (value: Power[]) => void;
  wording: "ask" | "detail";
}) {
  return (
    <ul aria-label="Access" className="flex flex-col divide-y rounded-xl border bg-card">
      {powers.map((power) => {
        const PowerIcon = icons[power];
        const info = powerInfo[power];
        const id = `power-${power}`;
        return (
          <li key={power} className="flex items-center gap-3 px-4 py-3">
            {wording === "detail" && (
              <span className="grid size-9 shrink-0 place-content-center rounded-md bg-surface text-fg-body">
                <PowerIcon className="size-5" aria-hidden />
              </span>
            )}
            <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer flex-col">
              <span className="type-body-sm-medium text-fg-heading">
                {wording === "ask" ? info.askName : info.short}
              </span>
              <span className="type-caption text-fg-caption">
                {wording === "ask" ? info.ask : info.detail}
              </span>
            </label>
            <Switch
              id={id}
              checked={value.includes(power)}
              onCheckedChange={(checked) =>
                onChange(checked ? [...value, power] : value.filter((each) => each !== power))
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
