import { Badge } from "@/components/ui/badge";

interface FileVersionBadgeProps {
  version: number;
  isNew?: boolean;
}

export function FileVersionBadge({ version, isNew = false }: FileVersionBadgeProps) {
  if (version === 1 && !isNew) {
    return null; // v1は表示しない
  }

  return (
    <Badge
      className={`
        absolute top-2 right-2
        ${
          isNew
            ? 'bg-orange-500/90 text-white border-orange-600 motion-safe:animate-pulse'
            : 'bg-slate-600/90 text-slate-200 border-slate-500'
        }
      `}
    >
      {isNew && 'NEW '}v{version}
    </Badge>
  );
}
