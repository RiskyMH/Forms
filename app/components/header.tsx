import { getCurrentUser } from "@/utils/jwt";
import { Suspense, type PropsWithChildren } from "react";
import { UserNav } from "./header.client";
import Link from "next/link";
import { ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/utils/db";
import { eq } from "drizzle-orm";
import { cn } from "@/utils/tw";

export default function Header({ children, name = "Forms", justLoading = false, userMenuMargin = true }: PropsWithChildren<{ name?: string, justLoading?: boolean, userMenuMargin?: boolean }>) {
    return (
        <div className="sticky flex items-center justify-between border-b-2 top-0 z-40 bg-background px-7">
            <header className="flex h-16 w-full items-center gap-4">

                <nav className={cn("w-auto", userMenuMargin && "me-auto")}>
                    <Button asChild variant="ghost">
                        <Link
                            className="flex items-center gap-2 hover:bg-transparent -ms-3"
                            href="/dashboard"
                        >
                            <ClipboardListIcon />
                            <h1 className="inline-block whitespace-nowrap font-bold text-lg">
                                {name}
                            </h1>
                        </Link>
                    </Button>
                </nav>

                {children}

                <div className={cn("flex justify-end ms-auto pl-2", !userMenuMargin && "ms-0")}>
                    {justLoading ? <UserMenuFallback /> : (
                        <Suspense fallback={<UserMenuFallback />}>
                            <UserMenu />
                        </Suspense>
                    )}
                </div>
            </header>
        </div>
    )
};

function UserMenuFallback() {
    return (
        <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
    )
}

async function UserMenu() {
    const userId = await getCurrentUser()
    if (!userId) return null

    const user = await db.query.user.findFirst({
        where: eq(schema.user.id, userId!)
    })
    if (!user) return null


    return (
        <UserNav user={{
            id: user.id,
            name: user.name,
            secondary: user.email,
            image: user.picture || undefined
        }} />
    );
}