'use client'
import { deleteField, makeField } from "@/actions/save-form";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/tw";
import { SquareIcon, CircleIcon, XIcon, CalendarIcon, ArrowUpIcon, ArrowDownIcon, MoreVerticalIcon, Trash2Icon, GripHorizontalIcon } from "lucide-react";
import React, { useEffect, useOptimistic, useState, startTransition, type PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";
import { Reorder, useDragControls } from "framer-motion"
import TooltipText from "@/components/tooltip-text";
import { useDebouncedCallback } from 'use-debounce';


export function IsSaving({ lastSaved }: { lastSaved: Date }) {
    const formStatus = useFormStatus()
    const [client, setClient] = useState(false)

    // useEffect for ctrl+s to submit form
    useEffect(() => {
        setClient(true)
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                document.getElementById("save")?.click()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    return (
        <button id="save" className={cn("text-muted-foreground me-auto text-sm hidden sm:block", !formStatus.pending && "hover:text-foreground")} type="submit">
            {client ? formStatus.pending ? "Saving..." : `Last saved ${new Date(lastSaved).toLocaleString()}` : ""}
        </button>
    )
}

export function MakeField({ formId, children, skeleton }: { formId: string, children: React.ReactNode, skeleton: React.ReactNode }) {

    const [optimistic, addOptimistic] = useOptimistic<number[]>(
        [],
        // @ts-expect-error i don't know types
        (state: number[], newNumber: number) => [...state, newNumber]
    )

    const make = (type: "text" | "choice" | "date") => () => {
        addOptimistic(Date.now())
        return makeField(formId, type)
    }

    return (
        <>
            {optimistic.map((id) => (
                <div key={id} >
                    {skeleton}
                </div>
            ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Choose field type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={make("text")}>Text</DropdownMenuItem>
                    <DropdownMenuItem onClick={make("choice")}>Choice</DropdownMenuItem>
                    <DropdownMenuItem onClick={make("date")}>Date</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

interface FieldProps {
    field: {
        id: string
        formId: string
        name?: string | null
        options?: string[] | null
        required?: boolean | null
        type: "text" | "choice" | "date"
        optionsStyle?: "dropdown" | "radio" | "checkbox" | null
        textSize?: "normal" | "textarea" | null
        index?: number | null
        otherOption?: boolean | null
        description?: string | null
        shuffleOptions?: boolean | null
        deleted?: boolean | null
    },
}

export function Field({ field: f }: FieldProps) {

    const [field, optimisticField] = useOptimistic<FieldProps["field"]>(
        f,
        // @ts-expect-error i don't know types
        (state: FieldProps["field"], changed: Partial<FieldProps["field"]>) => {
            return { ...state, ...changed }
        }
    )
    const save = () => document.getElementById("save")?.click()

    const changeField = async (changed: Partial<FieldProps["field"]>) => {
        startTransition(() => {
            optimisticField(changed)
            save()
        })

    }

    const [showDescription, setShowDescription] = useState(!!field.description)
    const controls = useDragControls()
    const debouncedSave = useDebouncedCallback(changeField, 500);

    return (
        <Reorder.Item key={field.id} value={field} dragListener={false} dragControls={controls}>
            <Card key={field.id} className={field.deleted ? "hidden" : "h-full"} id={field.id}>
                <div className="w-full">
                    <Button onPointerDown={(e) => controls.start(e)} variant="ghost" size="sm" className="mx-auto mt-1 py-1 px-3 h-auto block touch-none cursor-move">
                        <GripHorizontalIcon className="h-5 w-5 text-muted-foreground self-center" />
                    </Button>
                </div>

                <CardHeader className="pt-2">
                    <div className="flex gap-4 h-12">
                        <input type="hidden" name="form:field-ids" value={field.id} />
                        <Input
                            defaultValue={field.name || ""}
                            className="h-full text-xl leading-none tracking-tight w-full"
                            placeholder="Question"
                            name={`form:${field.id}:name`}
                            onChange={(v) => void debouncedSave({ name: v.target.value })}
                        />
                        {field.type === "text" ? (
                            <Select value={field.textSize || "normal"} onValueChange={(v: any) => {
                                document.getElementsByName(`form:${field.id}:text-size`)?.[0]?.setAttribute("value", v)
                                changeField({ textSize: v })
                            }}>
                                <SelectTrigger className="w-[180px] h-full">
                                    <input type="hidden" name={`form:${field.id}:text-size`} value={field.textSize || undefined} />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Short answer</SelectItem>
                                    <SelectItem value="textarea">Paragraph</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : field.type === "choice" ? (
                            <Select defaultValue={field.optionsStyle || "radio"} onValueChange={(v: any) => {
                                document.getElementsByName(`form:${field.id}:options-style`)?.[0]?.setAttribute("value", v)
                                changeField({ optionsStyle: v })
                            }}>
                                <SelectTrigger className="w-[200px] h-full ">
                                    <input type="hidden" name={`form:${field.id}:options-style`} value={field.optionsStyle || undefined} />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="radio">Multiple Choice</SelectItem>
                                    <SelectItem value="checkbox">Checkboxes</SelectItem>
                                    <SelectItem value="dropdown">Drop-down</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : field.type === "date" ? (
                            <Select defaultValue="date">
                                <SelectTrigger className="w-[180px] h-full ">
                                    {/* <input type="hidden" name={`form:${field.id}:date-style`} value="..." /> */}
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : null}
                    </div>
                    <AutosizeTextarea
                        defaultValue={field.description || ""}
                        className={cn("text-sm text-muted-foreground focus:text-foreground", !showDescription && "hidden")}
                        placeholder="Description..."
                        name={`form:${field.id}:description`}
                        onChange={(v) => void debouncedSave({ description: v.target.value })}
                    />
                </CardHeader>

                {field.type === "choice" && (
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {field.options?.map((option, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    {field.optionsStyle === "checkbox" ? (
                                        <SquareIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : field.optionsStyle === "radio" ? (
                                        <CircleIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <span className="text-muted-foreground">{i + 1}. </span>
                                    )}
                                    <Input
                                        key={option + i}
                                        defaultValue={option}
                                        className="w-full"
                                        placeholder="Option"
                                        name={`form:${field.id}:options`}
                                        onChange={(v) => void debouncedSave({ options: field.options?.map((o, j) => j === i ? v.target.value : o) })}
                                    />
                                    <Button variant="secondary" size="sm" className="flex-shrink-0" disabled={(field.options?.length || 1) === 1} onClick={(e) => {
                                        e.preventDefault()
                                        document.getElementsByName(`form:${field.id}:options`)?.[i]?.setAttribute("name", "false")
                                        changeField({ options: field.options?.filter((_, j) => j !== i) })
                                    }}>
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {field.otherOption && (
                                <div className="flex gap-2 items-center">
                                    {field.optionsStyle === "checkbox" ? (
                                        <SquareIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : field.optionsStyle === "radio" ? (
                                        <CircleIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <span className="text-muted-foreground">{(field.options?.length ?? 0) + 1}. </span>
                                    )}
                                    <TooltipText text="This option allows people to type in a custom answer.">
                                        <Input
                                            defaultValue="Other..."
                                            className="w-full"
                                            placeholder="Option"
                                            disabled
                                        />
                                    </TooltipText>
                                    <Button variant="secondary" size="sm" className="flex-shrink-0" onClick={() => {
                                        document.getElementsByName(`form:${field.id}:other-option`)?.[0]?.setAttribute("value", "false")
                                        changeField({ otherOption: false })
                                    }}>
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Button variant="outline" className="self-start" onClick={(e) => {
                                changeField({ options: [...(field.options || []), ''] })
                                // focus on the new input
                                setTimeout(() => {
                                    document.getElementsByName(`form:${field.id}:options`)?.[(field.options?.length || 0)]?.focus()
                                }, 0)
                            }}>
                                Add option
                            </Button>
                        </div>
                    </CardContent>
                )}

                {field.type === "date" && (
                    <CardContent>
                        <TooltipText text="This is what the date picker looks like for people who fill out the form.">
                            <Button
                                variant="outline"
                                disabled
                                className="w-[280px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>Pick a date</span>
                            </Button>
                        </TooltipText>
                    </CardContent>
                )}

                {field.type === "text" && (
                    <CardContent>
                        {field.textSize === "normal" ? (
                            <TooltipText text="This is what the short answer input looks like for people who fill out the form.">
                                <Input
                                    defaultValue="Short-answer text"
                                    className="w-[280px]"
                                    disabled
                                />
                            </TooltipText>
                        ) : (
                            <TooltipText text="This is what the textarea input looks like for people who fill out the form.">
                                <Textarea
                                    defaultValue="Long-answer text"
                                    className="w-full"
                                    disabled
                                />
                            </TooltipText>
                        )}
                    </CardContent>
                )}
                <CardFooter>
                    <div className="flex gap-4 flex-row w-full">
                        <div className="ms-auto flex items-center space-x-2">
                            <Label htmlFor={`${field.id}:required`} className="text-sm">Required</Label>
                            <Switch id={`${field.id}:required`} className="scale-90" checked={field.required ?? false} onCheckedChange={() => {
                                document.getElementsByName(`form:${field.id}:required`)?.[0]?.setAttribute("value", (field.required ? "false" : "true"))
                                changeField({ required: !field.required })
                            }} />
                            <input type="hidden" name={`form:${field.id}:required`} value={field.required ? "true" : "false"} />
                            <input type="hidden" name={`form:${field.id}:shuffle-options`} value={field.shuffleOptions ? "true" : "false"} />
                            <input type="hidden" name={`form:${field.id}:other-option`} value={field.otherOption ? "true" : "false"} />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary">
                                    <MoreVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem
                                    checked={field.required ?? false}
                                    onCheckedChange={(required) => {
                                        document.getElementsByName(`form:${field.id}:required`)?.[0]?.setAttribute("value", (required ? "true" : "false"))
                                        changeField({ required })
                                    }}
                                >
                                    Required
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={showDescription}
                                    onCheckedChange={(v) => {
                                        setShowDescription(v)
                                        if (!v) {
                                            document.getElementsByName(`form:${field.id}:description`)?.[0]?.setAttribute("value", "")
                                            changeField({ description: "" })
                                        }
                                    }}
                                >
                                    Show description
                                </DropdownMenuCheckboxItem>
                                {field.type === "choice" && (
                                    <DropdownMenuCheckboxItem
                                        checked={field.shuffleOptions ?? false}
                                        onCheckedChange={(shuffleOptions) => {
                                            document.getElementsByName(`form:${field.id}:shuffle-options`)?.[0]?.setAttribute("value", (shuffleOptions ? "true" : "false"))
                                            changeField({ shuffleOptions })
                                        }}
                                    >
                                        Shuffle option order
                                    </DropdownMenuCheckboxItem>
                                )}
                                {field.type === "choice" && field.optionsStyle !== "dropdown" && (
                                    <DropdownMenuCheckboxItem
                                        checked={field.otherOption ?? false}
                                        onCheckedChange={(otherOption) => {
                                            document.getElementsByName(`form:${field.id}:other-option`)?.[0]?.setAttribute("value", (otherOption ? "true" : "false"))
                                            changeField({ otherOption })
                                        }}
                                    >
                                        Add &quot;Other&quot; option
                                    </DropdownMenuCheckboxItem>
                                )}

                                <DropdownMenuItem
                                    className="text-red-500 flex gap-2 hover:text-destructive-foreground hover:bg-destructive/80"
                                    onClick={() => {
                                        deleteField(field.formId, field.id)
                                        changeField({ deleted: true })
                                    }}
                                >
                                    <Trash2Icon className="h-5 w-5" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardFooter>
            </Card>
        </Reorder.Item >
    )
}


export function DnD({ fields }: { fields: FieldProps["field"][] }) {

    const [fieldss, setFieldss] = useState(fields)
    useEffect(() => setFieldss(fields), [fields])

    return (
        <Reorder.Group axis="y" values={fieldss} onReorder={setFieldss} >
            <div className="flex flex-col gap-6">
                {fieldss.map((field) => (
                    <Field key={field.id} field={field} />
                ))}
            </div>
        </Reorder.Group>
    )
}

