import { baseUrl } from "@/utils/const";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata = {
    title: "Login",
    robots: {
        index: false,
        follow: false,
    }
} satisfies Metadata


export default function Login() {

    const state = "{}"
    const redirect_uri = `${baseUrl}/api/oauth/google`
    const client_id = process.env.GOOGLE_CLIENT_ID!
    // https://developers.google.com/identity/protocols/oauth2/web-server#httprest
    const googleOauthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=email&access_type=offline&state=${state}`;

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col overflow-hidden">
            {/* // make the login link max size  */}
            <Link
                href={googleOauthUrl}
                style={{ fontSize: "clamp(1.5rem, 35vw, 2000rem)" }}
                className="underline hover:text-blue-600 login-link p-2 w-full text-center"
            >
                Login
            </Link>
        </div>
    )
}