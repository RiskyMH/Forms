import FormPagePage from "@/f/[id]/page";
import { Modal } from "./modal.client";

export default function FormPage({ params }: { params: { formId: string } }) {
    return (
        <Modal>
            <FormPagePage params={{ id: params.formId }} noEdit />
        </Modal>
    )
}