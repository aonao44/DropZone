"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Package, User, Settings, LogOut } from "lucide-react"
import { DropZoneLogo } from "@/components/dropzone-logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <DropZoneLogo isDark={true} />

            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/pricing" className="text-base lg:text-lg text-muted-foreground transition-colors hover:text-foreground font-medium">
                料金
              </Link>
              <Link href="/dashboard" className="text-base lg:text-lg text-muted-foreground transition-colors hover:text-foreground font-medium">
                ダッシュボード
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:glow-blue-sm transition-all">
                  <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    ダッシュボード
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    設定
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
