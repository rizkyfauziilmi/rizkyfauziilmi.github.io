import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sliderTrackVariants = cva(
    "relative grow overflow-hidden rounded-md select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1",
    {
        variants: {
            variant: {
                default: "bg-muted",
                invert: "bg-background/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const sliderIndicatorVariants = cva(
    "select-none data-horizontal:h-full data-vertical:w-full",
    {
        variants: {
            variant: {
                default: "bg-primary",
                invert: "bg-background",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const sliderThumbVariants = cva(
    "relative block size-3 shrink-0 rounded-md border transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:ring-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-ring bg-white ring-ring/30",
                invert: "border-background bg-background ring-background/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface SliderProps
    extends
        SliderPrimitive.Root.Props,
        VariantProps<typeof sliderTrackVariants> {}

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    variant = "default",
    ...props
}: SliderProps) {
    const _values = Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max];

    return (
        <SliderPrimitive.Root
            className={cn(
                "data-horizontal:w-full data-vertical:h-full",
                className,
            )}
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            thumbAlignment="edge"
            {...props}
        >
            <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
                <SliderPrimitive.Track
                    data-slot="slider-track"
                    className={cn(sliderTrackVariants({ variant }))}
                >
                    <SliderPrimitive.Indicator
                        data-slot="slider-range"
                        className={cn(sliderIndicatorVariants({ variant }))}
                    />
                </SliderPrimitive.Track>

                {Array.from({ length: _values.length }, (_, index) => (
                    <SliderPrimitive.Thumb
                        data-slot="slider-thumb"
                        key={index}
                        className={cn(sliderThumbVariants({ variant }))}
                    />
                ))}
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    );
}

export { Slider };
