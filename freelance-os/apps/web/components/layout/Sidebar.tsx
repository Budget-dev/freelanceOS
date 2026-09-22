"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  ClipboardList,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.5rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Signout error", err);
    }
  };

  const displayName = user?.displayName || "Freelancer";
  const displayEmail = user?.email || "freelancer@example.com";
  const initials = (user?.displayName
    ? user.displayName.slice(0, 2)
    : user?.email
      ? user.email.slice(0, 2)
      : "FL"
  ).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.div
        className={cn(
          "sidebar fixed left-0 top-0 z-50 h-full shrink-0 border-r bg-[#FDFCFB] transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed && !isMobileOpen ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <motion.div
          className="relative z-40 flex h-full shrink-0 flex-col bg-[#FDFCFB] text-muted-foreground transition-all"
          variants={contentVariants}
        >
          <motion.ul variants={staggerVariants} className="flex h-full flex-col">
            <div className="flex grow flex-col items-center">
              
              {/* Logo Section */}
              <div className="flex h-[60px] w-full shrink-0 border-b px-2 py-3">
                <Link href="/dashboard" className="flex w-full items-center px-1" onClick={() => isMobileOpen && onMobileClose()}>
                  <Button variant="ghost" size="sm" className="flex w-full items-center justify-start gap-3 px-2 hover:bg-transparent">
                    <motion.li variants={variants} className="flex items-center">
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="text-[15px] font-bold text-foreground">
                          FreelanceOS
                        </span>
                      )}
                    </motion.li>
                  </Button>
                </Link>
              </div>

              <div className="flex h-full w-full flex-col overflow-hidden">
                <div className="flex grow flex-col gap-4">
                  <ScrollArea className="h-16 grow p-3 py-4">
                    <div className="flex w-full flex-col gap-1">
                      
                      {/* Primary action */}
                      <Link href="/analyze" onClick={() => isMobileOpen && onMobileClose()} className={cn(
                        "mb-3 flex h-9 w-full flex-row items-center rounded-md px-2 transition-colors",
                        pathname?.includes("analyze") 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-muted text-foreground hover:bg-muted/80"
                      )}>
                        <div className="flex shrink-0 w-5 items-center justify-center">
                          <Search className="h-[18px] w-[18px]" />
                        </div>
                        <motion.li variants={variants} className="flex overflow-hidden">
                          {(!isCollapsed || isMobileOpen) && (
                            <p className="ml-3 truncate text-sm font-medium">Analyze Project</p>
                          )}
                        </motion.li>
                      </Link>

                      <Separator className="my-1.5 w-full bg-border/50" />

                      <Link href="/dashboard" onClick={() => isMobileOpen && onMobileClose()} className={cn(
                        "flex h-9 w-full flex-row items-center rounded-md px-2 transition-colors",
                        pathname === "/dashboard" 
                          ? "bg-black/[0.04] text-foreground font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <div className="flex shrink-0 w-5 items-center justify-center">
                          <LayoutDashboard className="h-[18px] w-[18px]" />
                        </div>
                        <motion.li variants={variants} className="flex overflow-hidden">
                          {(!isCollapsed || isMobileOpen) && <p className="ml-3 truncate text-[13.5px]">Dashboard</p>}
                        </motion.li>
                      </Link>
                      
                      <Link href="/history" onClick={() => isMobileOpen && onMobileClose()} className={cn(
                        "flex h-9 w-full flex-row items-center rounded-md px-2 transition-colors",
                        pathname?.includes("history") 
                          ? "bg-black/[0.04] text-foreground font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <div className="flex shrink-0 w-5 items-center justify-center">
                          <History className="h-[18px] w-[18px]" />
                        </div>
                        <motion.li variants={variants} className="flex overflow-hidden">
                          {(!isCollapsed || isMobileOpen) && <p className="ml-3 truncate text-[13.5px]">Analysis History</p>}
                        </motion.li>
                      </Link>
                      
                      <Link href="/applications" onClick={() => isMobileOpen && onMobileClose()} className={cn(
                        "flex h-9 w-full flex-row items-center rounded-md px-2 transition-colors",
                        pathname?.includes("applications") 
                          ? "bg-black/[0.04] text-foreground font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <div className="flex shrink-0 w-5 items-center justify-center">
                          <ClipboardList className="h-[18px] w-[18px]" />
                        </div>
                        <motion.li variants={variants} className="flex overflow-hidden">
                          {(!isCollapsed || isMobileOpen) && <p className="ml-3 truncate text-[13.5px]">Applications</p>}
                        </motion.li>
                      </Link>
                      
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="flex flex-col border-t border-border/50 p-3 pb-4">
                  <Link href="/settings" onClick={() => isMobileOpen && onMobileClose()} className={cn(
                    "mb-1 flex h-9 w-full flex-row items-center rounded-md px-2 transition-colors",
                    pathname?.includes("settings") 
                      ? "bg-black/[0.04] text-foreground font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <div className="flex shrink-0 w-5 items-center justify-center">
                      <Settings className="h-[18px] w-[18px]" />
                    </div>
                    <motion.li variants={variants} className="flex overflow-hidden">
                      {(!isCollapsed || isMobileOpen) && <p className="ml-3 truncate text-[13.5px]">Settings</p>}
                    </motion.li>
                  </Link>
                  
                  <div>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="w-full outline-none" asChild>
                        <button className="flex h-11 w-full flex-row items-center gap-3 rounded-md px-1.5 transition-colors hover:bg-muted">
                          <Avatar className="size-[26px] shrink-0">
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
                          </Avatar>
                          <motion.li variants={variants} className="flex w-full items-center overflow-hidden">
                            {(!isCollapsed || isMobileOpen) && (
                              <div className="flex flex-col items-start text-left">
                                <span className="truncate text-[13px] font-medium leading-tight text-foreground">{displayName}</span>
                                <span className="truncate text-[11px] leading-tight text-muted-foreground">Pro Plan</span>
                              </div>
                            )}
                          </motion.li>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" sideOffset={10} className="w-56">
                        <div className="flex flex-row items-center gap-2 p-2">
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">{displayName}</span>
                            <span className="line-clamp-1 text-xs text-muted-foreground">{displayEmail}</span>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/profile" className="flex items-center gap-2" onClick={() => isMobileOpen && onMobileClose()}>
                            <UserCircle className="h-4 w-4" /> Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive">
                          <LogOut className="h-4 w-4" /> Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </motion.ul>
        </motion.div>
      </motion.div>
    </>
  );
}
