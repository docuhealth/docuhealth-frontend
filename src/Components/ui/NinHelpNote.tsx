import { Info } from "lucide-react";

// Shown under every NIN input for patients who don't have their NIN to hand
const NinHelpNote = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-slate-700 ${className}`}>
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-docuhealth-primary" aria-hidden="true" />
        <p>
            <span className="font-semibold">Don’t know your NIN?</span> Please dial{" "}
            <a href="tel:*346%23" className="font-semibold text-docuhealth-primary underline underline-offset-2">
                *346#
            </a>{" "}
            using the phone number you used to register for your NIN to retrieve it on your phone.
        </p>
    </div>
);

export default NinHelpNote;
