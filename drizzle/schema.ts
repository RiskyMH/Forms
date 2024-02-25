import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, numeric, json, boolean, integer } from "drizzle-orm/pg-core";

// forms app
export const user = pgTable("user", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").$type<"admin" | "basic">().default("basic"),
    picture: text("picture"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const userRelations = relations(user, ({ many }) => ({
    oauth: many(oauth),
}));

export const oauth = pgTable("oauth", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    provider: text("provider").$type<"google">().notNull(),
    providerId: text("provider_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const oauthRelations = relations(oauth, ({ one }) => ({
    user: one(user, {
        fields: [oauth.userId],
        references: [user.id],
    }),
}));


// The form 
export const form = pgTable("form", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    lastModified: timestamp("last_modified").defaultNow(),
});
export const formRelations = relations(form, ({ many, one }) => ({
    fields: many(formField),
    user: one(user, {
        fields: [form.userId],
        references: [user.id],
    })
}));


export const formField = pgTable("form_field", {
    id: text("id").primaryKey().notNull(),
    formId: text("form_id").references(() => form.id, { onDelete: 'cascade' }).notNull(),
    index: integer("index"),
    name: text("name"),
    description: text("subtitle"),
    required: boolean("required").default(false),
    type: text("type").$type<"text" | "choice" | "date">().notNull(),

    // config for choices
    options: text("options").array(),
    shuffleOptions: boolean("shuffle_options").default(false),
    otherOption: boolean("other_option").default(false),
    optionsStyle: text("options_style").$type<"dropdown" | "radio" | "checkbox">().default("radio"),

    // config for text
    textSize: text("text_size").$type<"normal" | "textarea">().default("normal"),

});
export const formFieldRelations = relations(formField, ({ one }) => ({
    form: one(form, {
        fields: [formField.formId],
        references: [form.id],
    })
}))

// Submissions
export const formSubmission = pgTable("form_submission", {
    id: text("id").primaryKey().notNull(),
    formId: text("form_id").references(() => form.id, { onDelete: 'cascade' }).notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow(),
});
export const formSubmissionRelations = relations(formSubmission, ({ many, one }) => ({
    values: many(formSubmissionFieldValue),
    form: one(form, {
        fields: [formSubmission.formId],
        references: [form.id],
    }),
    user: one(user, {
        fields: [formSubmission.userId],
        references: [user.id],
    })
}))

export const formSubmissionFieldValue = pgTable("form_submission_field_value", {
    id: text("id").primaryKey().notNull(),
    submissionId: text("submission_id").references(() => formSubmission.id, { onDelete: 'cascade' }).notNull(),
    fieldId: text("field_id").notNull().references(() => formField.id, { onDelete: 'cascade' }).notNull(),
    value: text("value").array().notNull(),
});
export const formSubmissionFieldValueRelations = relations(formSubmissionFieldValue, ({ one }) => ({
    submission: one(formSubmission, {
        fields: [formSubmissionFieldValue.submissionId],
        references: [formSubmission.id],
    }),
    field: one(formField, {
        fields: [formSubmissionFieldValue.fieldId],
        references: [formField.id],
    })
}))
