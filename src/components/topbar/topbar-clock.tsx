import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// TODO: move this to os setting
const formats = [
    "HH:mm",
    "HH:mm:ss",
    "dd MMM HH:mm",
    "dd MMM yyyy HH:mm",
] as const;

// TODO: add calendar dropdown
export function TopbarClock() {
    const [now, setNow] = useState<Date>(new Date());
    const [selectedDate] = useState<Date>(
        new Date(),
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button variant="ghost">{format(now, formats[1])}</Button>
                }
            >
                Open Calendar
            </PopoverTrigger>
            <PopoverContent
                sideOffset={10}
                className="w-fit"
            >
                {/* TODO: add events */}
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                />
            </PopoverContent>
        </Popover>
    );
}
