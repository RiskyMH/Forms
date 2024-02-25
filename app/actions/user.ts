"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
    const c = cookies()
    c.delete('token')
    
    revalidatePath("/")
    redirect("/login")
}

