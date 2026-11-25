import {
  CaretRightIcon,
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { Payment } from "@/features/patient/api/pending-bills";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { cn } from "@/lib/utils";

const looks = {
  paid: { icon: CheckCircleIcon, tile: "bg-success-100 text-success-700" },
  declined: { icon: WarningCircleIcon, tile: "bg-error-100 text-error-500" },
  pending: { icon: ClockIcon, tile: "bg-warning-100 text-warning-700" },
};

/**
 * One payment in a `RecordList`: a status tile (green check, red ! when declined), the facility,
 * `detail` and the amount (greyed when declined). Opens its bill when `linked` and it has one.
 */
export function PaymentRow({
  payment,
  title,
  detail,
  linked = false,
}: {
  payment: Payment;
  title: string;
  detail: string;
  linked?: boolean;
}) {
  const { icon: StatusIcon, tile } = looks[payment.status];
  const body = (
    <>
      <span className={cn("grid size-9 shrink-0 place-content-center rounded-md", tile)}>
        <StatusIcon aria-hidden className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-body-sm-medium text-fg-heading">{title}</span>
        <span className="truncate type-caption text-fg-caption">{detail}</span>
      </span>
      <span
        className={cn(
          "shrink-0 type-body-sm-medium",
          payment.status === "declined" ? "text-fg-caption" : "text-fg-heading",
        )}
      >
        {formatNaira(payment.amount)}
      </span>
    </>
  );
  return (
    <li>
      {linked && payment.billId ? (
        <Link
          to="/patient/bills/$billId"
          params={{ billId: payment.billId }}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
        >
          {body}
          <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  );
}
