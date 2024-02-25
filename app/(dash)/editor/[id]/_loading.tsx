import Header from "@/components/header";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background" vaul-drawer-wrapper="">
            <Header justLoading />

            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
    )
}