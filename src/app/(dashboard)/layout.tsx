"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  Tag,
  LogOut,
  User,
  ChevronDown,
  Inbox,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Footer } from "@/components/ui/footer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getFirstName = (name?: string) => {
    if (!name) return "";
    return name.split(" ")[0];
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Tasks", href: "/dashboard/tasks", icon: Inbox },
    { name: "Categories", href: "/dashboard/categories", icon: Tag },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-background shadow-lg transition-all duration-300 lg:relative ${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between bg-card px-4">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary">
                TaskManager
              </span>
            </Link>
          )}
          <button
            className={`rounded-md p-2 text-muted-foreground hover:bg-accent ${
              sidebarOpen ? "ml-auto" : "mx-auto"
            }`}
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${sidebarOpen ? "mr-3" : "mx-auto"}`}
                  />
                  {sidebarOpen && item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom sidebar section with theme toggle and profile - now borderless */}
        <div className="p-4">
          <div
            className={`flex ${
              sidebarOpen
                ? "flex-row items-center justify-between"
                : "flex-col items-center space-y-4"
            }`}
          >
            <ThemeToggle minimal={!sidebarOpen} />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex ${
                    sidebarOpen
                      ? "w-auto items-center gap-2"
                      : "h-9 w-9 rounded-full p-0"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                    />
                    <AvatarFallback>
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <>
                      <span className="max-w-[80px] truncate text-sm">
                        {getFirstName(session?.user?.name)}
                      </span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex cursor-pointer items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile menu toggle */}
        <div className="flex h-16 items-center border-b bg-card px-4 lg:hidden">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="ml-4 text-xl font-bold text-primary">
            TaskManager
          </span>
        </div>

        {/* Main content container with flex structure to push footer to bottom */}
        <div className="flex flex-col flex-1 overflow-auto">
          <main className="flex-1 p-4 sm:p-6">{children}</main>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
