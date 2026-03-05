"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, MessageCircle, DollarSign, Users, Upload } from "lucide-react";

interface SandboxNavProps {
  sandboxId: string;
}

export function SandboxNav({ sandboxId }: SandboxNavProps) {
  const pathname = usePathname();
  const base = `/sandboxes/${sandboxId}`;

  const tabs = [
    { href: base, label: "Timeline", icon: ImageIcon },
    { href: `${base}/upload`, label: "Upload", icon: Upload },
    { href: `${base}/chat`, label: "Chat", icon: MessageCircle },
    { href: `${base}/expenses`, label: "Expenses", icon: DollarSign },
    { href: `${base}/people`, label: "People", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-midnight/10 safe-bottom z-20">
      <div className="flex items-center justify-around max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-3 px-4 tap-target transition-colors ${
                isActive ? "text-ocean" : "text-midnight/40 hover:text-midnight"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
