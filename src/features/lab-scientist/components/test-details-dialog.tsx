import { FormDialog } from "@/components/dashboard/form-dialog";
import type { CatalogueTest } from "@/features/lab-scientist/api/schemas";
import { TestDetailsForm } from "@/features/lab-scientist/components/test-details-form";

/**
 * The lab admin's Add test (`test` null), Set up test (a test without details) and Edit test
 * dialog. The form mounts afresh each time it opens, so it starts from the test's saved details.
 */
export function TestDetailsDialog({
  open,
  onOpenChange,
  test,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: CatalogueTest | null;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && <TestDetailsForm test={test} onDone={() => onOpenChange(false)} />}
    </FormDialog>
  );
}
