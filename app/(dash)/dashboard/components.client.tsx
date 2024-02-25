'use client'
import { cn } from "@/utils/tw"
import { Loader2, PlusIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"

export function IsLoading({ children, className }: { children: ReactNode, className: string }) {
    const formStatus = useFormStatus()

    return (
        formStatus.pending ? (
            <Loader2 className={cn(className, "animate-spin")} />
        ) : (
            children
        )
    )
}
