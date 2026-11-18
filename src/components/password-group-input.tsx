import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

/**
 * A password input for use inside an `InputGroup`, with a show/hide button at its end. Any other
 * addon (e.g. a lock icon) can sit beside it in the same group.
 */
export function PasswordGroupInput(props: Omit<ComponentProps<typeof InputGroupInput>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <InputGroupInput type={visible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </>
  );
}
