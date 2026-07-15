import {
    BatteryFullIcon,
    PowerIcon,
    SpeakerHighIcon,
    WifiHighIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { NotificationButton } from "./notification";

export function TopbarQuickSettings() {
    return (
        <div>
            <NotificationButton total={0} />
            <Button variant="ghostInvert">
                <div className="flex items-center gap-3">
                    <WifiHighIcon />
                    <SpeakerHighIcon />
                    <BatteryFullIcon />
                    <PowerIcon />
                </div>
            </Button>
        </div>
    );
}
