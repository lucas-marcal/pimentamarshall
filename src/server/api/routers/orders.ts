import { CartState } from "redux/cart.slice";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

interface Order {
  nome: string;
  sobrenome: string;
  endereco: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
  items: CartState;
  orderTotal: number;
}

const cartProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  urlSlug: z.string(),
  quantity: z.number(),
});

const orderSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  urlSlug: z.string(),
  quantity: z.number(),
});

const cartSchema = z.array(cartProductSchema);

export const ordersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      orderBy: [{ orderOnPage: "asc" }],
    });

    return products;
  }),

  createOrderItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string(),
        price: z.number(),
        urlSlug: z.string(),
        quantity: z.number(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const newOrderItem = await ctx.prisma.orderItem.create({
            data: {
                quantity: input.quantity,
                value: input.price,
                shoppingOrder: {
                  connect: { id: input.orderId}
                },
                item: {
                  connect: {id: input.id}
                }
            }
        })

        return newOrderItem
    }),

  createOrder: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        sobrenome: z.string(),
        endereco: z.string(),
        numero: z.string(),
        complemento: z.string().optional(),
        cidade: z.string(),
        estado: z.string(),
        cep: z.string(),
        items: cartSchema,
        orderTotal: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newOrder = await ctx.prisma.shopOrder.create({
        data: {
          status: "PENDING",
          totalValue: Number(input.orderTotal),
          paymentMethod: "PIX",
          shippingAddress: {
            create: {
              address1: input.endereco,
              city: input.cidade,
              number: Number(input.numero),
              region: input.estado,
              zipCode: input.cep,
              complement: input.complemento,
            },
          },
          shippingMethod: {
            connect: { id: "cli39fxlq0000v4lk7neufuuo" },
          },
        },
      });

      return newOrder;
    }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const productBySlug = await ctx.prisma.product.findUnique({
      where: { urlSlug: input },
    });

    return productBySlug;
  }),
});
