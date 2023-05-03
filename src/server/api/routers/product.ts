import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const productRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany();

    return products
  }),
});
