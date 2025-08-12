import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type FixedToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: FixedToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as FixedToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };