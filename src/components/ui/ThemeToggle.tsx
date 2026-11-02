import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full border border-slate-800 bg-slate-900/90 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700",
        className
      )}
      title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -20, opacity: 0, scale: 0.9 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 20, opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.12 }}
        className="flex items-center justify-center"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-300" />
        )}
      </motion.div>
    </button>
  );
}
