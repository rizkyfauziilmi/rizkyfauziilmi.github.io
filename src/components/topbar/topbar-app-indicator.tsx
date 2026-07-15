import { AppWindowIcon } from "@phosphor-icons/react";

export function TopbarAppIndicator() {
    return (
        <div className="flex items-center gap-2">
            <AppWindowIcon />
            <p className="text-muted-foreground text-xs">No Apps</p>
        </div>
    );
}
