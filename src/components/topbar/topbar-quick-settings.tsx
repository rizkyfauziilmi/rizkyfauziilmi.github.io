import {
    AirplaneIcon,
    BatteryFullIcon,
    BellSlashIcon,
    GearSixIcon,
    LockIcon,
    MapPinIcon,
    MoonIcon,
    PowerIcon,
    SpeakerHighIcon,
    SpeakerLowIcon,
    SunDimIcon,
    SunIcon,
    WifiHighIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { NotificationButton } from "./notification";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "../ui/slider";
import { Toggle } from "../ui/toggle";

export function TopbarQuickSettings() {
    return (
        <div>
            <NotificationButton total={0} />
            <QuickSettings />
        </div>
    );
}

function QuickSettings() {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button variant="ghostInvert">
                        <div className="flex items-center gap-3">
                            <WifiHighIcon />
                            <SpeakerHighIcon />
                            <BatteryFullIcon />
                            <PowerIcon />
                        </div>
                    </Button>
                }
            >
                Open Quick Settings
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="bg-primary text-background w-fit"
                sideOffset={10}
            >
                <PopoverHeader>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center rounded-b-full rounded-t-full gap-2 bg-background/10 w-fit p-1 pr-4">
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>RFI</AvatarFallback>
                            </Avatar>
                            <p className="text-xs">@rizkyfauziilmi</p>
                        </div>
                        <div>
                            <Button variant="ghostInvert">
                                <GearSixIcon />
                            </Button>
                            <Button variant="ghostInvert">
                                <LockIcon />
                            </Button>
                            <Button variant="ghostInvert">
                                <PowerIcon />
                            </Button>
                        </div>
                    </div>
                </PopoverHeader>
                <div className="px-2 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <SpeakerLowIcon className="size-5" />
                            <Slider
                                variant="invert"
                                defaultValue={[33]}
                                max={100}
                                step={1}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <SunIcon className="size-5" />
                            <Slider
                                variant="invert"
                                defaultValue={[33]}
                                max={100}
                                step={1}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {/* Baris 1 */}
                        <Toggle
                            aria-label="Toggle Wifi"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <WifiHighIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Jangan Ganggu"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <BellSlashIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Mode Pesawat"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <AirplaneIcon className="size-5" />
                        </Toggle>

                        {/* Baris 2 */}
                        <Toggle
                            aria-label="Toggle Tema Gelap"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <MoonIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Night Light"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <SunDimIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Lokasi"
                            size="lg"
                            variant="invert"
                            className="w-full h-12"
                        >
                            <MapPinIcon className="size-5" />
                        </Toggle>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
