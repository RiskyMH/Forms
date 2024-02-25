import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db, schema } from "@/utils/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const form = await db.query.form.findFirst({
        where: eq(schema.form.id, params.id),
        columns: {
            name: true,
        },
    })

    if (!form) notFound()

    return {
        title: `${form.name} - Submitted`,
        description: form.name,
        robots: {
            index: false,
            follow: false,
        }
    }
}

export default async function SubmittedFormPage({ params }: { params: { id: string } }) {
    const form = await db.query.form.findFirst({
        where: eq(schema.form.id, params.id),
        columns: {
            id: true,
            name: true,
        },
    })

    if (!form) return notFound();

    return (
        <div className="min-h-screen bg-background container lg:max-w-[750px] flex flex-col gap-6 py-5">
            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <h1 className="text-2xl font-bold">{form.name}</h1>
                    <p className="whitespace-break-spaces">Your response has been recorded.</p>
                </CardHeader>
                <CardContent>
                    <Link href={`/f/${form.id}`} className="text-primary underline hover:text-primary/80">
                        Submit another response
                    </Link>
                </CardContent>
            </Card>
        </div>
    )

}