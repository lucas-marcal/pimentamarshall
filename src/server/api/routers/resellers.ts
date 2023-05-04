import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const resellerRouter = createTRPCRouter({

  getAll: publicProcedure.query(async ({ ctx }) => {
    const resellers = await ctx.prisma.reseller.findMany({orderBy: [{orderOnPage: "asc"}]});

    return resellers
  }),
});
