import Head from "next/head";
import { api } from "~/utils/api";

const Dashboard = () => {
  const products = api.product.getAll.useQuery().data;
  const orders = api.order.getAll.useQuery().data;

  return (
    <>
      <Head>
        <title>Dashboard | Pimenta Marshall</title>
        <meta name="description" content="Painel do pimenteiro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center overscroll-none bg-neutral-900 pb-16 pt-5 text-neutral-50">
        <div className="relative flex max-w-2xl flex-col gap-4 px-3">
            {orders?.map((item) => (
                <div className="my-6" key={item.id}>
                    <p>ID: {item.id}</p>
                    <p>Criado em: {JSON.stringify(item.createdAt)}</p>
                    <p>Método de pagamento: {item.paymentMethod}</p>
                    <p>Status: {item.status}</p>
                    <p>Valor total: {item.totalValue}</p>
                    <p>Produtos:</p><OrderProducts orderId={item.id} />
                    <p>Dados do Cliente:</p><ClientInfo addressId={item.addressId} />
                </div>
            ))}
        </div>
      </main>
    </>
  );
};

const OrderProducts = (props: {orderId: string}) => {
    const orderItems = api.order.getOrderItems.useQuery(props.orderId).data;

    return (
        <div className="">
            {orderItems?.map((item) => (
                <div className="my-4" key={item.id}>
                <p>{JSON.stringify(item, null, 2)}</p>
                </div>
            ))}
        </div>
    )
}

const ClientInfo = (props: {addressId: string}) => {
    const clientInfo = api.order.getClientInfo.useQuery(props.addressId).data;

    return (
        <div className="">
                <div className="my-4">
                <p>{JSON.stringify(clientInfo, null, 2)}</p>
                </div>
        </div>
    )
}

export default Dashboard;
