import Link from "next/link";

const navigation = [
  {
    name: "Product",
    items: [
      { name: "About", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    name: "Support",
    items: [
      { name: "Contact & Support", href: "/contact" },
      { name: "Help Center", href: "/help" },
    ],
  },
  {
    name: "Legal",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
  {
    name: "Account",
    items: [
      { name: "AI Settings", href: "/settings/ai" },
      { name: "Billing", href: "/billing" },
      { name: "Account Settings", href: "/settings" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="font-bold text-xl tracking-tight text-foreground">
              FreelanceOS
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered opportunity intelligence for freelancers.
            </p>
          </div>

          {navigation.map((section) => (
            <div key={section.name} className="flex flex-col gap-4 lg:ml-auto">
              <h3 className="font-semibold text-foreground text-sm">{section.name}</h3>
              <ul className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <span>© {new Date().getFullYear()} FreelanceOS. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 font-medium">
            <span>AI-powered</span>
            <span className="hidden sm:inline">•</span>
            <span>Secure</span>
            <span className="hidden sm:inline">•</span>
            <span>Built for freelancers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
