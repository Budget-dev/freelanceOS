"use client";

import { cn } from "@/lib/utils";
import {
  Mail, Phone, Linkedin, MessageCircle, Globe, Link2,
  CheckCircle2, AlertTriangle, XCircle, ExternalLink, Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DiscoveredContact, ContactStatus } from "@/hooks/use-mock-analysis";
import { useState } from "react";

const STATUS_CONFIG: Record<
  ContactStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
  },
  potential: {
    label: "Needs Verification",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200/60",
  },
  not_found: {
    label: "Not Found",
    icon: XCircle,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200/60",
  },
};

const TYPE_ICONS: Record<DiscoveredContact["type"], typeof Mail> = {
  email: Mail,
  phone: Phone,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  website: Globe,
  other: Link2,
};

const TYPE_LABELS: Record<DiscoveredContact["type"], string> = {
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  website: "Website",
  other: "Link",
};

interface ContactCardProps {
  contact: DiscoveredContact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [copied, setCopied] = useState(false);
  const statusCfg = STATUS_CONFIG[contact.status];
  const StatusIcon = statusCfg.icon;
  const TypeIcon = TYPE_ICONS[contact.type];

  const isLink =
    contact.status === "verified" &&
    (contact.type === "linkedin" ||
      contact.type === "whatsapp" ||
      contact.type === "website" ||
      contact.type === "email");

  const href =
    contact.type === "email"
      ? `mailto:${contact.value}`
      : contact.type === "phone"
      ? `tel:${contact.value}`
      : contact.value.startsWith("http")
      ? contact.value
      : `https://${contact.value}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm",
        statusCfg.border,
        statusCfg.bg
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          contact.status === "verified"
            ? "bg-white shadow-sm"
            : "bg-white/60"
        )}
      >
        <TypeIcon className={cn("h-4 w-4", statusCfg.color)} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {TYPE_LABELS[contact.type]}
          </span>
          <Badge
            className={cn(
              "h-5 gap-1 px-1.5 text-[10px] font-medium",
              statusCfg.border,
              statusCfg.bg,
              statusCfg.color
            )}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {statusCfg.label}
          </Badge>
        </div>

        <p className="truncate text-sm font-medium text-foreground">
          {contact.value}
        </p>

        <p className="text-[11px] text-muted-foreground">{contact.source}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy"}
        >
          <Copy className={cn("h-3.5 w-3.5", copied && "text-emerald-500")} />
        </Button>
        {isLink && contact.status === "verified" && (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Open">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

/** Shown when no contacts were found at all */
export function NoContactsCard() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <XCircle className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          No client contact found
        </p>
        <p className="text-xs text-muted-foreground">
          The analyzed content did not contain identifiable contact information.
        </p>
      </div>
    </div>
  );
}
