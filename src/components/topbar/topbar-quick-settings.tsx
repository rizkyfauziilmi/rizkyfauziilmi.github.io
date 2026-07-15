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
import { useTheme } from "../theme-provider";

export function TopbarQuickSettings() {
    return (
        <div>
            <NotificationButton total={0} />
            <QuickSettings />
        </div>
    );
}

function QuickSettings() {
    const { setTheme, theme } = useTheme();

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button variant="ghost">
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
            <PopoverContent align="end" className="w-fit space-y-2" sideOffset={10}>
                <PopoverHeader>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center rounded-b-full rounded-t-full gap-2 bg-muted border dark:border-0 p-1 pr-4">
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>RFI</AvatarFallback>
                            </Avatar>
                            <p className="text-xs">@rizkyfauziilmi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon-lg">
                                <GearSixIcon />
                            </Button>
                            <Button variant="outline" size="icon-lg">
                                <LockIcon />
                            </Button>
                            <Button variant="outline" size="icon-lg">
                                <PowerIcon />
                            </Button>
                        </div>
                    </div>
                </PopoverHeader>
                <div className="px-2 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <SpeakerLowIcon className="size-5" />
                            <Slider defaultValue={[33]} max={100} step={1} />
                        </div>
                        <div className="flex items-center gap-2">
                            <SunIcon className="size-5" />
                            <Slider defaultValue={[33]} max={100} step={1} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {/* Baris 1 */}
                        <Toggle
                            aria-label="Toggle Wifi"
                            size="lg"
                            className="w-full h-12"
                            disabled
                        >
                            <WifiHighIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Jangan Ganggu"
                            size="lg"
                            className="w-full h-12"
                            disabled
                        >
                            <BellSlashIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Mode Pesawat"
                            size="lg"
                            className="w-full h-12"
                            disabled
                        >
                            <AirplaneIcon className="size-5" />
                        </Toggle>

                        {/* Baris 2 */}
                        <Toggle
                            aria-label="Toggle Tema Gelap"
                            size="lg"
                            className="w-full h-12"
                            pressed={theme === "dark"}
                            onPressedChange={(pressed) =>
                                setTheme(pressed ? "dark" : "light")
                            }
                        >
                            <MoonIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Night Light"
                            size="lg"
                            className="w-full h-12"
                            disabled
                        >
                            <SunDimIcon className="size-5" />
                        </Toggle>
                        <Toggle
                            aria-label="Toggle Lokasi"
                            size="lg"
                            className="w-full h-12"
                            disabled
                        >
                            <MapPinIcon className="size-5" />
                        </Toggle>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
