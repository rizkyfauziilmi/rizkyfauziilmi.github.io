import { cn } from "@/lib/utils";

import { InputGroupAddon, InputGroupText } from "@/components/ui/input-group";

interface TerminalPromptProps {
  prompt: string;
  className?: string;
  textClassName?: string;
}

export function TerminalPrompt({
  prompt,
  className,
  textClassName,
}: TerminalPromptProps) {
  return (
    <InputGroupAddon
      variant="none-style"
      className={cn("absolute top-0 left-0 z-10 leading-5", className)}
    >
      <InputGroupText className={cn("text-orange-200", textClassName)}>
        {prompt}
      </InputGroupText>
    </InputGroupAddon>
  );
}
