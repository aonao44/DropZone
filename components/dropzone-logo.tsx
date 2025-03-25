import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface DropZoneLogoProps {
  isDark?: boolean;
}

export function DropZoneLogo({ isDark = false }: DropZoneLogoProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
        <Plus className="w-7 h-7 text-cyan-300 relative z-10" />
      </div>
      <h1 className="text-2xl font-bold text-cyan-300">DropZone</h1>
    </div>
  );
}
