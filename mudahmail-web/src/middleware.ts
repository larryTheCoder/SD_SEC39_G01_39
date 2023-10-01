import {getToken} from "next-auth/jwt"
import {withAuth} from "next-auth/middleware"
import {NextResponse} from "next/server"

// For the time being, the withAuth middleware only supports "jwt" as session strategy.
export default withAuth(
    async function middleware(req, event) {
        const token = await getToken({req})
        const isAuth = !!token
        const isAuthPage =
            req.nextUrl.pathname === "/" ||
            req.nextUrl.pathname.startsWith("/register");
        const isApiPage = req.nextUrl.pathname.startsWith("/api");

        if (isAuthPage) {
            console.log("is auth page")
            console.log(isAuth)
            // I am in "login" page now  I check if the user is authenticated or not
            if (isAuth) {
                // If I get here it means user is on "login" page, and it is authenticated. then redirect it to whatever url
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }

            return null
        }

        if (isApiPage) {
            return NextResponse.next();
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/?from=${encodeURIComponent(from)}`, req.url)
            );
        }
    },
    {
        callbacks: {
            authorized() {
                // This is a work-around for handling redirect on auth pages.
                // We return true here so that the middleware function above
                // is always called.
                return true;
            },
        },
    }
)

// specify on which routes you want to run the middleware
export const config = {
    matcher: ["/", "/register", "/dashboard"],
}