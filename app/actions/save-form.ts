'use server'

import { db, schema } from "@/utils/db"
import { getCurrentUser } from "@/utils/jwt"
import { createId } from "@paralleldrive/cuid2"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function SaveForm(data: FormData) {
    const formId = data.get('form:id')
    const userId = await getCurrentUser()
    if (!userId || !formId || typeof formId !== "string") return "unauthorized"

    const name = (data.get('form:name') ?? undefined) as string | undefined
    const description = (data.get('form:description') ?? undefined) as string | undefined

    const change = await db.update(schema.form)
        .set({
            name,
            description,
            lastModified: new Date(),
        })
        .where(and(
            eq(schema.form.id, formId),
            eq(schema.form.userId, userId)
        ))
        .returning({ id: schema.form.id })

    if (!change?.[0]?.id) return "unauthorized"

    console.time("update")

    const fieldIds = data.getAll("form:field-ids")
    await Promise.all(
        fieldIds.map((fieldId, i) => {
            if (typeof fieldId !== "string") return

            const name = (data.get(`form:${fieldId}:name`) ?? undefined) as string | undefined
            const description = (data.get(`form:${fieldId}:description`) ?? undefined) as string | undefined
            const required = (data.get(`form:${fieldId}:required`) ?? undefined) as string | undefined

            const options = (data.getAll(`form:${fieldId}:options`) ?? undefined) as string[] | undefined
            const otherOption = (data.get(`form:${fieldId}:other-option`) ?? undefined) as string | undefined
            const optionsStyle = (data.get(`form:${fieldId}:options-style`) ?? undefined) as "dropdown" | "radio" | "checkbox" | undefined
            const shuffleOptions = (data.get(`form:${fieldId}:shuffle-options`) ?? undefined) as "true" | "false" | undefined
            const textSize = (data.get(`form:${fieldId}:text-size`) ?? undefined) as "normal" | "textarea" | undefined

            return db.update(schema.formField)
                .set({
                    name,
                    description,
                    options,
                    otherOption: otherOption === undefined ? undefined : otherOption === "true",
                    required: required === undefined ? undefined : required === "true",
                    shuffleOptions: shuffleOptions === undefined ? undefined : shuffleOptions === "true",
                    optionsStyle,
                    textSize,
                    index: i,
                })
                .where(and(
                    eq(schema.formField.id, fieldId),
                    eq(schema.formField.formId, formId)
                ))
        })
    )
    console.timeEnd("update")

    revalidatePath(`/f/${formId}`)
    revalidatePath(`/f/${formId}/submitted`)
    return revalidatePath(`/editor/${formId}`)
}

export async function makeField(formId: string, type: "text" | "choice" | "date") {
    const userId = await getCurrentUser()
    if (!userId || !formId) return "unauthorized"

    const field = await db.insert(schema.formField)
        .values({
            formId,
            name: "New Field",
            type,
            index: sql<number>`COALESCE((SELECT MAX(index) FROM form_field WHERE form_id = ${formId}), -1) + 1`,
            id: createId(),
            options: type === "choice" ? ["New choice"] : undefined,
        })
        .returning({ id: schema.formField.id })

    if (!field?.[0]?.id) return "unauthorized"

    revalidatePath(`/f/${formId}`)
    return revalidatePath(`/editor/${formId}`)
}

export async function deleteField(formId: string, fieldId: string) {
    const userId = await getCurrentUser()
    if (!userId || !formId) return "unauthorized"

    const field = await db.delete(schema.formField)
        .where(and(
            eq(schema.formField.formId, formId),
            eq(schema.formField.id, fieldId)
        ))
        .returning({ id: schema.formField.id })

    if (!field) return "unauthorized"

    revalidatePath(`/f/${formId}`)
    return revalidatePath(`/editor/${formId}`)
}

export async function makeForm() {
    const userId = await getCurrentUser()
    if (!userId) return "unauthorized"

    const form = await db.insert(schema.form)
        .values({
            name: "Untitled Form",
            userId,
            id: createId()
        })
        .returning({ id: schema.form.id })

    if (!form?.[0]?.id) return "unauthorized"

    await db.insert(schema.formField)
        .values([
            {
                name: "Untitled Question",
                formId: form[0].id,
                id: createId(),
                type: "text",
                index: 0,
            }
        ])

    return redirect(`/editor/${form[0].id}`)
}