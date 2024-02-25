'use client'
import { cn } from "@/utils/tw";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";

export function Search({ className }: { className?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams();

    const ref = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (searchParams.has("q") && ref.current) {
            ref.current.value = searchParams.get("q") || ""
        }
    }, [searchParams])

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const q = form.q.value

        if (!q) return router.push("./")
        router.push(`?q=${q}`)
    }        

    return (
        <form
            onSubmit={onSubmit}
            className={cn(className, "hidden sm:flex group w-full lg:w-[30rem] h-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-secondary rounded-lg self-center mx-5 gap-2")}
        >
            <Button size="icon-sm" variant="ghost" className="self-center text-muted-foreground rounded-full flex-shrink-0 m-0.5 p-1.5 focus-visible:ring-offset-0 focus-visible:ring-1" type="submit">
                <SearchIcon className="self-center text-muted-foreground" />
            </Button>
            <input
                ref={ref}
                type="search"
                placeholder="Search"
                name="q"
                className="w-full focus-visible:outline-none bg-transparent"
            />
            <Button size="icon-sm" variant="ghost" className="self-center text-muted-foreground rounded-full flex-shrink-0 m-0.5 p-1.5 focus-visible:ring-offset-0 focus-visible:ring-1" type="reset" onClick={() => router.push("./")}>
                <XIcon className="self-center text-muted-foreground" />
            </Button>
        </form>
    )
}