import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcutsDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.shiftKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open command palette' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'E'], description: 'Export data' },
    { keys: ['Esc'], description: 'Close dialogs' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate faster
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, kidx) => (
                    <kbd
                      key={kidx}
                      className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

