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
    const orders = await ctx.prisma.shopOrder.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return orders;
  }),

  getOrderItems: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: { shopOrderId: input },
        include: { item: true }
      });

      return orderItems;
    }),

  getClientInfo: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const clientInfo = await ctx.prisma.address.findUnique({
        where: { id: input },
      });

      return clientInfo;
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
            connect: { id: input.orderId },
          },
          item: {
            connect: { id: input.id },
          },
        },
      });

      return newOrderItem;
    }),

  createOrder: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        sobrenome: z.string(),
        email: z.string().email(),
        telefone: z.string().optional(),
        endereco: z.string(),
        numero: z.string(),
        complemento: z.string().optional(),
        bairro: z.string(),
        cidade: z.string(),
        estado: z.string(),
        cep: z.string(),
        items: cartSchema,
        shipping: z.object({
          type: z.string(),
          price: z.number(),
          id: z.string(),
        }),
        orderTotal: z.number(),
        paymentMethod: z.string(),
        deliveryTime: z.date().optional(),
        hasLobby: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newOrder = await ctx.prisma.shopOrder.create({
        data: {
          clientName: input.nome,
          clientLastName: input.sobrenome,
          clientEmail: input.email,
          clientTel: input.telefone,
          status: "PENDING",
          totalValue: Number(input.orderTotal),
          paymentMethod: input.paymentMethod,
          hasLobby: input.hasLobby,
          deliveryTime: input.deliveryTime,
          shippingAddress: {
            create: {
              address1: input.endereco,
              city: input.cidade,
              number: Number(input.numero),
              bairro: input.bairro,
              region: input.estado,
              zipCode: input.cep,
              complement: input.complemento,
            },
          },
          shippingMethod: {
            connect: { id: input.shipping.id },
          },
        },
      });

      return newOrder;
    }),

  addTxid: publicProcedure
    .input(z.object({ id: z.string(), txid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedOrder = ctx.prisma.shopOrder.update({
        where: { id: input.id },
        data: { txid: input.txid },
      });

      return updatedOrder;
    }),

  getOneOrder: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const oneOrder = await ctx.prisma.shopOrder.findUnique({
      where: { id: input },
    });

    return oneOrder;
  }),

  changeOrderStatus: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const updatedOrder = ctx.prisma.shopOrder.update({
      where: { id: input },
      data: { status: "DELIVERED" },
    });

    return updatedOrder;
  })
});
