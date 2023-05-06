import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const productRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({orderBy: [{orderOnPage: "asc"}]});

    return products
  }),

  getSlugs: publicProcedure.query(async ({ ctx }) => {
    const slugs = await ctx.prisma.product.findMany({
        select: {
          urlSlug: true,
        },
      });

    return slugs
  }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ctx, input}) => {
    const productBySlug = await ctx.prisma.product.findUnique({ where: {urlSlug: input, },})

    return productBySlug
  })
});
