import { cn } from "@/lib/utils";
interface OnlineIndicatorProps {
  isOnline: boolean;
}

const OnlineIndicator = ({ isOnline }: OnlineIndicatorProps) => {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-background",
        "h-3 w-3",
        isOnline ? "bg-green-500" : "bg-gray-400",
        "rounded-full border-2 border-background",
        "absolute -bottom-0.5 -right-0.5"
      )}
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
};

export default OnlineIndicator;
