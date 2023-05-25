import { createTRPCRouter } from "~/server/api/trpc";
import { productRouter } from "./routers/product";
import { resellerRouter } from "./routers/resellers";
import { ordersRouter } from "./routers/orders";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  reseller: resellerRouter,
  order: ordersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
