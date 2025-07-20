
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react"
import { Button } from "./button"

const alertBannerVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-green-50 text-green-800 border-green-200 [&>svg]:text-green-600",
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200 [&>svg]:text-yellow-600",
        error: "bg-red-50 text-red-800 border-red-200 [&>svg]:text-red-600",
        info: "bg-blue-50 text-blue-800 border-blue-200 [&>svg]:text-blue-600",
        mcdonalds: "bg-mc-yellow/10 text-mc-red border-mc-yellow/30 [&>svg]:text-mc-red",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, variant, title, children, dismissible, onDismiss, ...props }, ref) => {
    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-4 w-4" />
        case "warning":
          return <AlertTriangle className="h-4 w-4" />
        case "error":
          return <XCircle className="h-4 w-4" />
        case "info":
          return <Info className="h-4 w-4" />
        case "mcdonalds":
          return <Info className="h-4 w-4" />
        default:
          return <Info className="h-4 w-4" />
      }
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        {getIcon()}
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm [&_p]:leading-relaxed">
            {children}
          </div>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5"
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Cerrar</span>
          </Button>
        )}
      </div>
    )
  }
)
AlertBanner.displayName = "AlertBanner"

export { AlertBanner, alertBannerVariants }
