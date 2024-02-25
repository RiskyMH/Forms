import Header from "@/components/header"
import { getCurrentUser } from "@/utils/jwt"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SendButton } from "../components"
import { getForm } from "../tools"
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"
import { db, schema } from "@/utils/db"
import { eq, desc, asc } from "drizzle-orm"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }) {
    const userId = await getCurrentUser()
    const form = await getForm(params.id, userId!)
    if (!form) notFound()

    return {
        title: `${form.name} Responses`,
        description: `Responses to the form: ${form.name}`,
        robots: {
            index: false,
            follow: false,
        }
    } satisfies Metadata
}


export default async function ResponsesPage({ params }: { params: { id: string } }) {
    const userId = await getCurrentUser()
    const form = await getForm(params.id, userId!)
    if (!form) notFound()

    return (
        <div className="min-h-screen bg-background" vaul-drawer-wrapper="">
            <Header userMenuMargin={false} name={form.name}>
                {/* more buttons */}
                <SendButton formId={form.id}>
                    <Button className="ms-auto">
                        Send
                    </Button>
                </SendButton>
            </Header>
            <div className="container lg:max-w-[750px] pt-5 flex flex-col gap-6 mb-5">
                <Card className="border-t-4 border-t-primary">
                    <div className="flex flex-col gap-1.5 p-6">
                        <h1 className="text-2xl font-bold">{form.name}</h1>
                        <p className="whitespace-break-spaces">View the responses to the form.</p>
                    </div>

                    <CardFooter>
                        {/* buttons */}
                        <div className="flex gap-4">
                            <SendButton formId={form.id}>
                                <Button variant="secondary">
                                    Share
                                </Button>
                            </SendButton>

                            <Button variant="secondary" asChild>
                                <Link href={`/editor/${form.id}`}>
                                    Edit
                                </Link>
                            </Button>

                            <Button variant="secondary">
                                Settings
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <Suspense fallback={<LoadingResponsesList />}>
                    <ResponsesList formId={form.id} />
                </Suspense>

            </div>
        </div>
    )
}

function LoadingResponsesList() {
    return (
        // todo: make better loading
        <div className="w-full justify-center items-center flex">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
    )
}

async function ResponsesList({ formId }: { formId: string }) {
    const fields = await db.query.formField.findMany({
        where: eq(schema.formField.formId, formId),
        orderBy: asc(schema.formField.index),
    })

    return (
        fields.map((field, index) => (
            <Card key={field.id}>
                <CardHeader>
                    <h2 className="text-xl">{field.name || `Question ${index + 1}`}</h2>
                </CardHeader>
                <CardContent>
                    <ResponsesListData fieldId={field.id} />
                </CardContent>
            </Card>
        ))
    )
}

async function ResponsesListData({ fieldId }: { fieldId: string }) {
    const responses = await db.query.formSubmissionFieldValue.findMany({
        where: eq(schema.formSubmissionFieldValue.fieldId, fieldId),
        columns: {
            value: true,
        },
    })

    const map = new Map<string, number>()
    for (const response of responses) {
        for (const value of response.value) {
            map.set(value, (map.get(value) || 0) + 1)
        }
    }

    return (
        <ul className="list-disc pl-4 text-sm">
            {Array.from(map).map(([value, count]) => (
                <li key={value}>
                    {value} <span className="text-muted-foreground">({count})</span>
                </li>
            ))}
        </ul>
    )
}