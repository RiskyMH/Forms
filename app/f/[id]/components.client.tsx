"use client";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/utils/tw";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState, type PropsWithChildren } from "react";
import { submitForm } from "@/actions/submit-form";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";


export function TheForm({ children }: PropsWithChildren) {
    const [state, formAction] = useFormState(submitForm, {})
    if (state?.error) {
        toast.error(state.error)
    }

    return (
        <form
            className="min-h-screen bg-background container lg:max-w-[750px] flex flex-col gap-6 py-5"
            action={formAction}
        >
            {children}
        </form>
    )
}

export function SubmitFormButton() {
    const formStatus = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={formStatus.pending}
            className="flex gap-2"
        >
            {/* {formStatus.pending ? "Submitting..." : "Submit"} */}
            {formStatus.pending && <Loader2 className="animate-spin" />} Submit
        </Button>
    )

}

interface FieldProps {
    field: {
        id: string
        name?: string | null
        options?: string[] | null
        required?: boolean | null
        type: "text" | "choice" | "date"
        optionsStyle?: "dropdown" | "radio" | "checkbox" | null
        textSize?: "normal" | "textarea" | null
        otherOption?: boolean | null
        description?: string | null
    },
}

export function TextField({ field }: FieldProps) {
    const formStatus = useFormStatus();

    return (
        field.textSize === "normal" ? (
            <Input
                name={field.id}
                type="text"
                placeholder="Your answer"
                className="w-full sm:w-[280px]"
                required={!!field.required}
                disabled={formStatus.pending}
            />
        ) : (
            <AutosizeTextarea
                name={field.id}
                className="w-full"
                placeholder="Your answer"
                required={!!field.required}
                disabled={formStatus.pending}
            />
        )
    )
}

export function ChoiceFieldRadio({ field }: FieldProps) {
    const formStatus = useFormStatus();
    const [value, setValue] = useState<null | string>(null)

    useEffect(() => {
        const form = document.querySelector("form")
        form?.addEventListener("reset", () => setValue(null))
        return () => form?.removeEventListener("reset", () => setValue(null))
    }, [])

    return (
        <RadioGroup
            className="gap-4"
            required={!!field.required}
            disabled={formStatus.pending}
            name={field.id}
            // @ts-expect-error this is valid...
            value={value}
            onValueChange={(e) => {
                setValue(e)
                if (field.otherOption) {
                    const elem = document.getElementById(`${field.id}:other-input`)
                    if (document.getElementById(`${field.id}:other`)?.ariaChecked === "true") {
                        elem?.focus()
                    } else if (elem) {
                        // @ts-expect-error
                        elem.value = ""
                    }
                }
            }}
        >
            {field.options?.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                    <RadioGroupItem
                        className="h-5 w-5 border-muted-foreground/80 border-2 [&[aria-checked='true']]:border-primary"
                        id={`${field.id}:${option}:${i}`}
                        value={option}
                        disabled={formStatus.pending}
                    />
                    <Label htmlFor={`${field.id}:${option}:${i}`}>{option}</Label>
                </div>
            ))}
            {field.otherOption && (
                <div className="flex items-center gap-2">
                    <RadioGroupItem
                        className="h-5 w-5 border-muted-foreground/80 border-2 [&[aria-checked='true']]:border-primary"
                        id={`${field.id}:other`}
                        value=""
                        disabled={formStatus.pending}
                    />
                    <Label htmlFor={`${field.id}:other`}>Other:</Label>
                    <Input
                        type="text"
                        id={`${field.id}:other-input`}
                        placeholder="Your answer"
                        className="w-full sm:w-[280px]"
                        disabled={formStatus.pending}
                        name={field.id}
                        onFocus={(e) => {
                            // if the input is focused, check the checkbox
                            const elem = document.getElementById(`${field.id}:other`)
                            if (elem?.ariaChecked !== "true") elem?.click()
                        }}
                    />
                </div>
            )}
        </RadioGroup>
    )
}

export function ChoiceFieldCheckbox({ field }: FieldProps) {
    const formStatus = useFormStatus();

    return (
        <div className="flex gap-4 flex-col">
            {field.options?.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Checkbox
                        id={`${field.id}:${option}:${i}`}
                        value={option}
                        className="h-5 w-5 border-muted-foreground/80 border-2 [&[aria-checked='true']]:border-primary"
                        disabled={formStatus.pending}
                        name={field.id}
                    />
                    <Label htmlFor={`${field.id}:${option}:${i}`}>{option}</Label>
                </div>
            ))}
            {field.otherOption && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${field.id}:other`}
                        value="other"
                        name={''}
                        className="h-5 w-5 border-muted-foreground/80 border-2 [&[aria-checked='true']]:border-primary"
                        disabled={formStatus.pending}
                        onCheckedChange={(e) => {
                            const elem = document.getElementById(`${field.id}:other-input`)
                            // if checked, focus on the input
                            if (e) elem?.focus()
                            // @ts-expect-error - else clear the input
                            else if (elem) elem.value = ""
                        }}
                    />
                    <Label htmlFor={`${field.id}:other`}>Other:</Label>
                    <Input
                        id={`${field.id}:other-input`}
                        type="text"
                        placeholder="Your answer"
                        className="w-full sm:w-[280px]"
                        name={field.id}
                        disabled={formStatus.pending}
                        onFocus={(e) => {
                            // if the input is focused, check the checkbox
                            const elem = document.getElementById(`${field.id}:other`)
                            if (elem?.ariaChecked !== "true") elem?.click()
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export function ChoiceFieldDropdown({ field }: FieldProps) {
    const formStatus = useFormStatus();
    const [value, setValue] = useState<string | undefined>(undefined);

    useEffect(() => {
        const form = document.querySelector("form")
        const fn = () => setValue(undefined)
        form?.addEventListener("reset", fn)
        return () => form?.removeEventListener("reset", fn)
    }, [])

    useEffect(() => {
        // @ts-expect-error hmmm
        if (!value) document.getElementsByName(field.id)[0].value = ""
    }, [value])

    return (
        <Select
            required={!!field.required}
            disabled={formStatus.pending}
            name={field.id}
            value={value}
            onValueChange={setValue}
        >
            <SelectTrigger className="w-full sm:w-[280px] [&[data-placeholder='']]:text-muted-foreground">
                {!value ? (
                    <span className="text-muted-foreground pointer-events-none">Choose</span>
                ) : (
                    <SelectValue />
                )}
            </SelectTrigger>
            <SelectContent>
                {/* @ts-expect-error - reset option */}
                <SelectItem className="text-muted-foreground">Choose</SelectItem>
                <SelectSeparator />
                {field.options?.map((option, i) => (
                    <SelectItem key={i} value={option || " "}>{option}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export function ChoiceField({ field }: FieldProps) {
    if (field.optionsStyle === "radio") {
        return <ChoiceFieldRadio field={field} />
    } else if (field.optionsStyle === "checkbox") {
        return <ChoiceFieldCheckbox field={field} />
    } else if (field.optionsStyle === "dropdown") {
        return <ChoiceFieldDropdown field={field} />
    } else {
        return null
    }
}

export function DateField({ field }: FieldProps) {
    const formStatus = useFormStatus();

    return (
        <Input
            name={field.id}
            type="date"
            className="w-full sm:w-[280px]"
            required={!!field.required}
            disabled={formStatus.pending}
        />
    )
}

export function PrivacyLink() {
    return <Link href="#" className="underline hover:font-bold" onClick={() => toast.message("What is privacy?")}>Privacy Policy</Link>
}

export function TermsLink() {
    return <Link href="#" className="underline hover:font-bold" onClick={() => toast.message("What are terms? Just be good!")}>Terms of Service</Link>
}