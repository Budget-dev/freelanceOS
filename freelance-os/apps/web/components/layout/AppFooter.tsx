import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="w-full mt-auto py-6 border-t border-border/40 text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} FreelanceOS</span>
        </div>
        
        <div className="flex items-center gap-4 font-medium">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>&middot;</span>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2">
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
