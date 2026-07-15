import {
    PowerIcon,
    SpeakerHighIcon,
    WifiHighIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";

export function TopbarQuickSettings() {
    return (
        <Button variant="ghostInvert">
            <div className="flex items-center gap-3">
                <WifiHighIcon />
                <SpeakerHighIcon />
                <PowerIcon />
            </div>
        </Button>
    );
}
