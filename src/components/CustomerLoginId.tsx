import { useState } from "react";
import { Copy, Check, Fingerprint } from "lucide-react";
import { toast } from "sonner";

type Props = {
  userId: string;
  email?: string;
};

export function CustomerLoginId({ userId, email }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      toast.success("Login ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Fingerprint className="h-3.5 w-3.5" />
        Customer Login ID
      </div>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-white/5 px-3 py-2 text-xs font-mono text-foreground/90">
          {userId}
        </code>
        <button
          onClick={copyId}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10"
          title="Copy Login ID"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {email && (
        <div className="mt-2 text-xs text-muted-foreground">
          Associated email: <span className="text-foreground/80">{email}</span>
        </div>
      )}
    </div>
  );
}