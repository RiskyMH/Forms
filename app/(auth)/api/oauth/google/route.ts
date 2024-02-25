import { baseUrl } from "@/utils/const";
import { db, schema } from "@/utils/db";
import { addUserTokenToCookie, createUserToken } from "@/utils/jwt";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server"

export const revalidate = 0

async function makeUserCookie(userId: string) {
    const token = await createUserToken({ id: userId })
    const response = NextResponse.redirect(new URL("/", baseUrl))
    response.cookies.set("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        path: "/",
    })
    return response
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    if (!code) return new Response("No code", { status: 400 });

    const tokenResult = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${baseUrl}/api/oauth/google`,
            grant_type: "authorization_code"
        })
    })

    const jsonResult = await tokenResult.json()

    if (jsonResult.error) {
        return new Response(jsonResult.error, { status: 400 });
    }

    const accessToken = jsonResult.access_token

    const userInfoResult = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })

    const userInfo = await userInfoResult.json()

    const oauthUser = await db.query.oauth.findFirst({
        where: and(
            eq(schema.oauth.providerId, userInfo.id),
            eq(schema.oauth.provider, "google")
        ),
        columns: {
            providerId: true,
            userId: true
        }
    })

    if (oauthUser) {
        // sync pfp
        await db.update(schema.user)
            .set({ picture: userInfo.picture })
            .where(eq(schema.user.id, oauthUser.userId))
            .execute()
            
        return makeUserCookie(oauthUser.userId)
    }
    
    // create user
    const newUser = await db.insert(schema.user)
        .values([{
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split("@")[0] || "User",
            id: createId(),
        }])
        .returning({ insertedId: schema.user.id })
        .execute()

    // create oauth
    await db.insert(schema.oauth)
        .values([{
            id: createId(),
            userId: newUser[0].insertedId,
            provider: "google",
            providerId: userInfo.id
        }])
        .execute()

    return makeUserCookie(newUser[0].insertedId)
}