
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 
            "group toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-primary/20 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
          title: "group-[.toast]:font-medium group-[.toast]:text-foreground",
          info: "group-[.toast]:bg-gradient-to-br group-[.toast]:from-primary/10 group-[.toast]:to-primary/5",
          success: "group-[.toast]:bg-gradient-to-br group-[.toast]:from-green-500/10 group-[.toast]:to-green-500/5",
          warning: "group-[.toast]:bg-gradient-to-br group-[.toast]:from-yellow-500/10 group-[.toast]:to-yellow-500/5",
          error: "group-[.toast]:bg-gradient-to-br group-[.toast]:from-destructive/10 group-[.toast]:to-destructive/5",
          closeButton: "group-[.toast]:rounded-full group-[.toast]:p-1.5 group-[.toast]:hover:bg-background",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
