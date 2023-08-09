import { Disclosure, Dialog } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { IncomingMessage, ServerResponse } from "http";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export async function getServerSideProps(context: {
  req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> };
  res: ServerResponse<IncomingMessage>;
}) {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");

  const getOrders = api.order.getAll.useQuery();
  const orders = getOrders.data;
  const updateOrder = api.order.changeOrderStatus.useMutation();

  const formatDateTime = (originalDate: Date) => {
    const date = originalDate.toLocaleDateString("pt-BR");
    const hour = originalDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const result = date + " - " + hour;

    return result;
  };

  const handleOpenModal = (orderId: string) => {
    setIsOpen(true);
    setSelectedOrder(orderId);
  };

  const handleOrderDelivered = async () => {
    try {
      await updateOrder.mutateAsync(selectedOrder);
      setIsOpen(false);
      await getOrders.refetch();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | Pimenta Marshall</title>
        <meta name="description" content="Painel do pimenteiro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center overscroll-none bg-neutral-900 pb-16 pt-5 text-neutral-50">
        <div className="relative flex w-full flex-col px-3 md:max-w-2xl">
          {orders?.map((item) => (
            <div key={item.id}>
              <div className="flex w-full justify-center rounded-t-md bg-red-600 p-2 align-middle text-sm text-red-950">
                <p>{formatDateTime(item.createdAt)}</p>
              </div>
              <div
                className="mb-6 flex w-full flex-col rounded-b-md border-2 border-red-600 bg-neutral-950 p-2 text-neutral-50"
                key={item.id}
              >
                <div className="mb-3 flex flex-col justify-between gap-3 p-2 align-middle leading-tight sm:flex-row">
                  <p className="self-center">
                    {item.clientName} {item.clientLastName}
                  </p>

                  <div className="flex gap-3 self-center align-middle leading-tight">
                    <p
                      className={
                        "" +
                        (item.status === "PENDING" ? "text-neutral-500" : "") +
                        (item.status === "PROCESSING" ? "text-amber-400" : "") +
                        (item.status === "DELIVERED" ? "text-lime-400" : "")
                      }
                    >
                      {item.status === "PENDING" ? "PENDENTE" : null}
                      {item.status === "PROCESSING" ? "PAGO" : null}
                      {item.status === "DELIVERED" ? "ENTREGUE" : null}
                    </p>
                    <p className="rounded bg-neutral-800 p-1 px-2 text-xs">
                      {item.paymentMethod === "pix" ? "PIX" : "Link"}
                    </p>
                    <p>R$ {item.totalValue.toString().replace(".", ",")}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={
                            "flex h-10 w-full justify-between bg-neutral-800 p-2 align-middle leading-tight text-neutral-300 " +
                            (open ? "rounded-t" : "rounded")
                          }
                        >
                          Produtos:
                          <ChevronRightIcon
                            className={
                              open
                                ? "rotate-90 transform text-lime-400"
                                : "text-lime-400"
                            }
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="rounded-b border border-neutral-800">
                          <OrderProducts orderId={open ? item.id : ""} />
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
                <div className="mb-2">
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={
                            "flex h-10 w-full justify-between bg-neutral-800 p-2 align-middle leading-tight text-neutral-300 " +
                            (open ? "rounded-t" : "rounded")
                          }
                        >
                          Endereço de entrega:
                          <ChevronRightIcon
                            className={
                              open
                                ? "rotate-90 transform text-lime-400"
                                : "text-lime-400"
                            }
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="rounded-b border border-neutral-800">
                          <ClientInfo addressId={open ? item.addressId : ""} />
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
                {item.shippingMethodId === "cli39fxlq0000v4lk7neufuuo" && (
                  <div className="flex flex-col gap-2 rounded border-2 border-red-950 p-2 text-sm">
                    <p className="uppercase text-red-600">
                      Entrega via Motoboy:
                    </p>
                    <p className="">
                      Entrega agendada para:{" "}
                      <span className="font-bold">
                        {item.hasLobby
                          ? "-"
                          : item.deliveryTime
                          ? formatDateTime(item.deliveryTime)
                          : null}
                      </span>
                    </p>
                    <p>
                      Possui porteiro:{" "}
                      <span
                        className={
                          item.hasLobby ? "text-lime-400" : "text-red-600"
                        }
                      >
                        {item.hasLobby ? "Sim" : "Não"}
                      </span>
                    </p>
                  </div>
                )}
                {item.status !== "DELIVERED" && (
                  <div className="">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item.id)}
                        className="mb-2 mt-4 rounded-md bg-lime-400 px-4 py-2 text-sm font-medium text-lime-900 hover:bg-lime-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                      >
                        Marcar como &quot;entregue&quot;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="rounded-md border-2 border-red-600 bg-neutral-950 p-3 text-neutral-50">
            <Dialog.Title className="text-center text-sm uppercase text-red-600">
              Marcar como entregue
            </Dialog.Title>
            <p className="py-4 text-center">
              Tem certeza que deseja marcar o pedido como &quot;entregue&quot;?
            </p>
            <div className="mt-2 flex w-full flex-wrap gap-3">
              <button
                className="w-full rounded bg-lime-400 px-4 py-3 text-lime-900"
                onClick={() => void handleOrderDelivered()}
              >
                Confirmar
              </button>
              <button
                className="w-full rounded px-4 py-3 text-red-600"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

const OrderProducts = (props: { orderId: string }) => {
  const getOrderItems = api.order.getOrderItems.useQuery(props.orderId, {
    enabled: props.orderId !== "",
  });

  const orderItems = getOrderItems.data;

  return (
    <div className="">
      {getOrderItems.isLoading ? (
        <p className="pt-2 text-center">•••</p>
      ) : (
        <>
          {orderItems?.map((orderItem) => (
            <div
              className="min-h-24 flex justify-between space-x-3 p-3 align-middle"
              key={orderItem.id}
            >
              <div className="flex gap-3 align-middle">
                <p className="m-0 self-center p-0 text-sm font-bold leading-none">
                  {orderItem.quantity} <span className="font-normal">x</span>
                </p>
                <div className="shrink-0 self-center">
                  <Image
                    alt={`Imagem do produto ${orderItem.item.name}`}
                    src={orderItem.item.image}
                    height={50}
                    width={50}
                    className=""
                  />
                </div>
                <div className="flex flex-col justify-evenly gap-2">
                  <p className="m-0 p-0 text-sm font-bold leading-none">
                    {orderItem.item.name}
                  </p>
                  <p className="m-0 p-0 text-sm leading-none">
                    R$ {orderItem.value.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between space-x-3">
                <p className="m-0 self-center p-0 text-sm leading-none">
                  R$
                  {(orderItem.value * orderItem.quantity)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const ClientInfo = (props: { addressId: string }) => {
  const getClientInfo = api.order.getClientInfo.useQuery(props.addressId, {
    enabled: props.addressId !== "",
  });

  const clientInfo = getClientInfo.data;

  return (
    <div className="">
      {getClientInfo.isLoading ? (
        <p className="pt-2 text-center">•••</p>
      ) : (
        <div className="p-4">
          <p className="">
            {clientInfo?.address1} - {clientInfo?.number}
          </p>
          <p className="">
            <span className="text-neutral-500">Complemento:</span>{" "}
            {clientInfo?.complement}
          </p>
          <p className="">
            <span className="text-neutral-500">Bairro:</span>{" "}
            {clientInfo?.bairro}
          </p>
          <p className="">
            <span className="text-neutral-500">Cidade:</span> {clientInfo?.city}
          </p>
          <p className="">
            <span className="text-neutral-500">Estado:</span>{" "}
            {clientInfo?.region}
          </p>
          <p className="">
            <span className="text-neutral-500">CEP:</span> {clientInfo?.zipCode}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
