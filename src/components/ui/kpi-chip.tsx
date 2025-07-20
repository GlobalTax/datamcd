
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const kpiChipVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        positive: "bg-green-50 text-green-700 border border-green-200",
        negative: "bg-red-50 text-red-700 border border-red-200",
        neutral: "bg-gray-50 text-gray-700 border border-gray-200",
        warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        mcdonalds: "bg-mc-yellow/10 text-mc-red border border-mc-yellow/30",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

export interface KpiChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiChipVariants> {
  value: string | number
  trend?: "up" | "down" | "neutral"
  label?: string
  showIcon?: boolean
}

const KpiChip = React.forwardRef<HTMLDivElement, KpiChipProps>(
  ({ className, variant, size, value, trend, label, showIcon = true, ...props }, ref) => {
    const getTrendIcon = () => {
      if (!showIcon) return null;
      
      switch (trend) {
        case "up":
          return <TrendingUp className="h-3 w-3" />
        case "down":
          return <TrendingDown className="h-3 w-3" />
        default:
          return <Minus className="h-3 w-3" />
      }
    }

    const getVariantByTrend = () => {
      if (variant) return variant;
      
      switch (trend) {
        case "up":
          return "positive"
        case "down":
          return "negative"
        default:
          return "neutral"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(kpiChipVariants({ variant: getVariantByTrend(), size, className }))}
        {...props}
      >
        {getTrendIcon()}
        <span className="font-semibold">{value}</span>
        {label && <span className="text-xs opacity-75">{label}</span>}
      </div>
    )
  }
)
KpiChip.displayName = "KpiChip"

export { KpiChip, kpiChipVariants }
