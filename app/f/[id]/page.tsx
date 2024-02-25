import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { db, schema } from "@/utils/db"
import { asc, eq } from "drizzle-orm"
import { notFound } from "next/navigation";
import { ChoiceField, DateField, SubmitFormButton, TextField, TheForm } from "./components.client";
import TooltipText from "@/components/tooltip-text";
import type { Metadata } from "next";
import { siteName } from "@/utils/const";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { getCurrentUser } from "@/utils/jwt";
import { Suspense } from "react";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const form = await db.query.form.findFirst({
        where: eq(schema.form.id, params.id),
        columns: {
            name: true,
            description: true,
        }
    })

    if (!form) notFound()

    return {
        title: form.name,
        description: form.description,
        openGraph: {
            title: form.name,
            description: form.description || "",
            type: "website",
            siteName
        },
        robots: {
            // todo: allow this to be true in settings
            index: false,
            // follow: false,
        }
    } satisfies Metadata
}

export default async function FormPage({ params, noEdit = false }: { params: { id: string }, noEdit?: boolean }) {
    const form = await db.query.form.findFirst({
        where: eq(schema.form.id, params.id),
        columns: {
            id: true,
            name: true,
            description: true,
        },
        with: {
            fields: {
                columns: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    required: true,
                    options: true,
                    shuffleOptions: true,
                    optionsStyle: true,
                    otherOption: true,
                    textSize: true,
                },
                orderBy: asc(schema.formField.index)
            },
            user: {
                columns: {
                    role: true,
                    id: true,
                }
            }
        }
    })

    if (!form) return notFound();

    for (const field of form.fields) {
        if (field.options && field.shuffleOptions) {
            field.options = field.options.sort(() => Math.random() - 0.5)
        }
    }

    return (
        <TheForm>
            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <input type="hidden" name="formId" value={form.id} />
                    <h1 className="text-2xl font-bold">{form.name}</h1>
                    <p className="whitespace-break-spaces">{form.description}</p>
                </CardHeader>
            </Card>

            {form.fields.map(field => (
                <Card key={field.id}>
                    <CardHeader>
                        <h2 className="text-xl flex gap-2">
                            {field.name}
                            {field.required && (
                                <TooltipText text="Question is required">
                                    <span className="text-primary">*</span>
                                </TooltipText>
                            )}
                        </h2>
                        <p className="text-muted-foreground whitespace-break-spaces">{field.description}</p>
                    </CardHeader>

                    <CardContent>
                        {field.type === "text" ? (
                            <TextField field={field} />
                        ) : field.type === "choice" ? (
                            <ChoiceField field={field} />
                        ) : field.type === "date" ? (
                            <DateField field={field} />
                        ) : null}
                    </CardContent>
                </Card>
            ))}

            <div className="flex">
                <SubmitFormButton />
                <Button className="ms-auto text-primary hover:text-primary" variant="ghost" type="reset">
                    Clear form
                </Button>
            </div>
            <div className="w-full flex pb-3">
                <p className="flex gap-2 text-muted-foreground text-xs mx-auto">
                    {form.user.role === "admin" ? "This form was made by RiskyMH." : "This content is neither created nor endorsed by RiskyMH."}
                    <Link href={`#report?form=${form.id}`} className="underline hover:font-bold">Report Abuse</Link>-
                    <Link href="#" className="underline hover:font-bold">Terms of Service</Link>-
                    <Link href="#" className="underline hover:font-bold">Privacy Policy</Link>
                </p>
            </div>
            {/* // TODO: when ppr works again, have edit button! */}
            {/* {!noEdit && (
                <Suspense fallback={<></>}>
                    <EditButton formId={form.id} ownerId={form.user.id} />
                </Suspense>
            )} */}
        </TheForm>
    )
}

async function EditButton({ formId, ownerId }: { formId: string, ownerId: string }) {
    const currentUserId = await getCurrentUser()
    if (currentUserId === ownerId) {
        return (
            <Button className="fixed bottom-5 right-5 text-primary rounded-full h-12 w-12" size="auto" variant="secondary" asChild>
                <Link href={`/editor/${formId}`}>
                    <PencilIcon className="h-6 w-6" />
                </Link>
            </Button>
        )
    }
}
