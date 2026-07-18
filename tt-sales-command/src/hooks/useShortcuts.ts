import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

interface ShortcutOptions {
  onNewSession?: () => void;
  onSave?: () => void;
}

export function useShortcuts(options?: ShortcutOptions) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+J / Ctrl+J -> Toggle Copilot
      if (cmdOrCtrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('copilot:toggle'));
      }

      // Cmd+N / Ctrl+N -> New Session (or trigger provided handler)
      if (cmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (options?.onNewSession) {
          options.onNewSession();
        } else {
          toast('Started a new Discovery Session', 'info');
          navigate('/team/discovery');
        }
      }

      // Cmd+S / Ctrl+S -> Save Session (or trigger provided handler)
      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (options?.onSave) {
          options.onSave();
        } else {
          toast('Progress auto-saved', 'success');
        }
      }

      // Quick Milestone Jumps (1-4)
      if (!cmdOrCtrl && !e.altKey && !e.shiftKey) {
        if (e.key === '1') {
          document.getElementById('pain-discovery')?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '2') {
          document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '3') {
          document.getElementById('walkthrough')?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === '4') {
          document.getElementById('proposal')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toast, options]);
}
