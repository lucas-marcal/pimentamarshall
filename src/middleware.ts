import { withAuth } from "next-auth/middleware";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log(req.nextauth.token);
    req.nextauth.token?.email;
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.email === "lucasmarcal@gmail.com",
    },
  }
);

export const config = { matcher: ["/dashboard"] };
