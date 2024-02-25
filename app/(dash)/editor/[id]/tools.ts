import { db, schema } from "@/utils/db";
import { and, eq } from "drizzle-orm";
import { cache } from "react";


export const getForm = cache(async (formId: string, userId: string) => {
    return await db.query.form.findFirst({
        where: and(
            eq(schema.form.userId, userId),
            eq(schema.form.id, formId)
        ),
        columns: {
            createdAt: true,
            lastModified: true,
            id: true,
            description: true,
            name: true,
        }
    })
})