import { CameraIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  BANNER_TYPES,
  MAX_BANNER_BYTES,
  useUpdateBanner,
} from "@/features/hospital-admin/api/mutations";
import {
  ActionMenuContent,
  ActionMenuItem,
} from "@/features/hospital-admin/components/action-menu";
import { getErrorMessage } from "@/lib/api";

/** The banner's pencil: change or delete the hospital's banner photo. */
export function BannerPhotoMenu({ hasCustomPhoto }: { hasCustomPhoto: boolean }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const update = useUpdateBanner();

  function save(file: File | null, done: string) {
    update.mutate(file, {
      onSuccess: () => toast.success(done),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function upload(file: File | undefined) {
    if (!file) return;
    if (!BANNER_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG or WebP photo.");
    } else if (file.size > MAX_BANNER_BYTES) {
      toast.error("The photo must be 5 MB or less.");
    } else {
      save(file, "Banner photo updated.");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            loading={update.isPending}
            className="absolute top-4 right-4 rounded-full bg-card/90 text-primary"
            aria-label="Banner photo options"
          >
            <PencilSimpleIcon weight="fill" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <ActionMenuContent>
          <ActionMenuItem
            // TODO(design): open the photo editor (crop / reposition) once it's designed.
            onSelect={() => toast.info("Editing the photo isn’t built yet.")}
          >
            <PencilSimpleIcon />
            Edit Photo
          </ActionMenuItem>
          <ActionMenuItem onSelect={() => fileInput.current?.click()}>
            <CameraIcon />
            Change Photo
          </ActionMenuItem>
          <ActionMenuItem
            variant="destructive"
            // The default photo can't be deleted.
            disabled={!hasCustomPhoto}
            onSelect={() => save(null, "Banner photo deleted.")}
          >
            <TrashIcon />
            Delete Photo
          </ActionMenuItem>
        </ActionMenuContent>
      </DropdownMenu>
      <input
        ref={fileInput}
        type="file"
        accept={BANNER_TYPES.join(",")}
        aria-label="Banner photo"
        className="hidden"
        onChange={(event) => {
          upload(event.target.files?.[0]);
          // Clear it so picking the same file again still fires a change.
          event.target.value = "";
        }}
      />
    </>
  );
}
