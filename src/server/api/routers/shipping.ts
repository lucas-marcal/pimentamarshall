import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const shippingRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({ ctx }) => {
    const shippings = await ctx.prisma.shippingMethod.findMany();

    return shippings
  }),
});
