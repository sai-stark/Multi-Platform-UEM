import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Save, X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Icon rendered in the header (left side) */
  icon: ReactNode;
  /** Dialog title displayed in the header */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Body content */
  children: ReactNode;
  /** Close button handler */
  onClose: () => void;
  /** Save button handler — used when formId is not set */
  onSave?: () => void;
  /** Cancel button handler */
  onCancel: () => void;
  /** Label for the save button */
  saveLabel?: string;
  /** Shows a loading spinner on the Save button and disables it */
  isLoading?: boolean;
  /** Disables the Save button */
  saveDisabled?: boolean;
  /** If set, Save button renders as type="submit" with this form ID */
  formId?: string;
  /** Additional className for DialogContent (e.g. wider width) */
  contentClassName?: string;
}

export function BaseDialog({
  open,
  onOpenChange,
  icon,
  title,
  subtitle,
  children,
  onClose,
  onSave,
  onCancel,
  saveLabel = 'Save Changes',
  isLoading = false,
  saveDisabled = false,
  formId,
  contentClassName,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Hide the default shadcn close button — we render our own in the header
        hideCloseButton
        className={cn(
          'max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-xl p-0',
          contentClassName,
        )}
      >
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          {/* ── HEADER ─────────────────────────────────────────── */}
        <div
          className={cn(
            'sticky top-0 z-20',
            'flex items-center justify-between',
            'px-6 pt-5 pb-4',
            'bg-card/70 backdrop-blur-sm',
            'border-b border-border/50',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold leading-tight truncate">
                {title}
              </DialogTitle>
              {subtitle && (
                <DialogDescription className="text-sm text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* Close button — 40×40 clickable area */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
              'inline-flex items-center justify-center',
              'min-w-[40px] min-h-[40px] p-2',
              'rounded-md',
              'hover:bg-muted',
              'transition-colors',
              'text-muted-foreground hover:text-foreground',
            )}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div className="flex-1 px-6 py-5">{children}</div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div
          className={cn(
            'sticky bottom-0 z-20',
            'flex justify-end gap-3',
            'px-6 py-4',
            'bg-card/70 backdrop-blur-sm',
            'border-t border-border/50 mt-auto',
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="min-h-[40px] px-4"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Cancel
          </Button>

          {formId ? (
            <Button
              type="submit"
              form={formId}
              variant="default"
              disabled={isLoading || saveDisabled}
              className="min-h-[40px] px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4" aria-hidden="true" />
              )}
              {saveLabel}
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={onSave}
              disabled={isLoading || saveDisabled}
              className="min-h-[40px] px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4" aria-hidden="true" />
              )}
              {saveLabel}
            </Button>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
