import CopyButton from "@/components/copy-button.client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { baseUrl } from "@/utils/const";
import { CopyIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";


export function SendButton({ children, formId }: PropsWithChildren<{ formId: string }>) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send form</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to submit responses.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={`${baseUrl}/f/${formId}`}
                            readOnly
                        />
                    </div>
                    <Button type="submit" size="sm" className="px-3" asChild>
                        <CopyButton text={`${baseUrl}/f/${formId}`}>
                            <span className="sr-only">Copy</span>
                            <CopyIcon className="h-4 w-4" />
                        </CopyButton>
                    </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}