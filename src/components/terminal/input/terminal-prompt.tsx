import { InputGroupAddon, InputGroupText } from "@/components/ui/input-group";

export function TerminalPrompt({ prompt }: { prompt: string }) {
  return (
    <InputGroupAddon
      variant="none-style"
      className="absolute top-0 left-0 z-10 leading-5"
    >
      <InputGroupText className="text-orange-200">{prompt}</InputGroupText>
    </InputGroupAddon>
  );
}
