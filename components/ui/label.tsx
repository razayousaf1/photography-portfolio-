import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block font-mono text-[11px] uppercase tracking-widest2 text-smoke mb-2",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
