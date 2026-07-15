import { BellRingingIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../ui/button";

interface NotificationButtonProps {
    total: number;
}

export function NotificationButton({ total = 0 }: NotificationButtonProps) {
    if (total <= 0) {
        return null
    }

    return (
        <Button variant="ghost">
            <BellRingingIcon />
            {total}
        </Button>
    );
}
