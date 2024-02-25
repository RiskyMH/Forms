import Header from "@/components/header";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, schema } from "@/utils/db";
import { getCurrentUser } from "@/utils/jwt";
import { asc, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IsSaving, MakeField, DnD } from "./components.client";
import { SaveForm } from "@/actions/save-form";
import { SendButton } from "./components";
import { getForm } from "./tools";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const userId = await getCurrentUser()
    const form = await getForm(params.id, userId!)
    if (!form) notFound()

    return {
        title: `Edit form: ${form.name}`,
        description: `Edit the form: ${form.name}`,
        robots: {
            index: false,
            follow: false,
        }
    } satisfies Metadata
}

export default async function EditForm({ params }: { params: { id: string } }) {
    const userId = await getCurrentUser()
    const form = await getForm(params.id, userId!)
    if (!form) notFound()

    return (
        <form className="min-h-screen bg-background" vaul-drawer-wrapper="" action={SaveForm} id="form">
            <Header userMenuMargin={false} name={form.name}>
                <IsSaving lastSaved={form.lastModified || new Date()} />
                {/* more buttons */}
                <Button variant="secondary" asChild>
                    <Link href={`/f/${form.id}`} className="hidden sm:flex ms:auto">
                        Preview
                    </Link>
                </Button>
                <SendButton formId={form.id}>
                    <Button className="ms-auto sm:ms-0">
                        Send
                    </Button>
                </SendButton>
            </Header>

            <div className="container lg:max-w-[750px] pt-5 flex flex-col gap-6 mb-5">
                {/* <h1>Edit form: {params.id}</h1> */}
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <input type="hidden" name="form:id" value={form.id} />
                        <Input
                            defaultValue={form.name}
                            className="h-14 text-2xl font-semibold leading-none tracking-tight"
                            placeholder="Untitled form"
                            name="form:name"
                        />
                        <AutosizeTextarea
                            defaultValue={form.description || ""}
                            className="text-sm text-muted-foreground focus:text-foreground"
                            placeholder="Form description"
                            name="form:description"
                        />
                    </CardHeader>

                    <CardFooter>
                        {/* buttons */}
                        <div className="flex gap-4">
                            <SendButton formId={form.id}>
                                <Button variant="secondary">
                                    Share
                                </Button>
                            </SendButton>

                            <Button variant="secondary" asChild>
                                <Link href={`/editor/${form.id}/responses`}>
                                    Responses
                                </Link>
                            </Button>

                            <Button variant="secondary">
                                Settings
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <Suspense fallback={<LoadingFields />}>
                    <Fields formId={form.id} />
                </Suspense>

                <MakeField formId={form.id} skeleton={<LoadingFields />}>
                    <Button variant="default" className="self-start">
                        Add question
                    </Button>
                </MakeField>

            </div>
        </form>
    )
}

async function Fields({ formId }: { formId: string }) {
    const fields = await db.query.formField.findMany({
        where: eq(schema.formField.formId, formId),
        orderBy: asc(schema.formField.index),
        columns: {
            id: true,
            formId: true,
            name: true,
            options: true,
            required: true,
            description: true,
            type: true,
            optionsStyle: true,
            textSize: true,
            shuffleOptions: true,
            index: true,
            otherOption: true,
        }
    })

    return (
        <DnD fields={fields} />
    )
}

function LoadingFields() {
    return (
        // todo: make better loading
        <div className="w-full justify-center items-center flex">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>

    )
}
