import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import store from "../../redux/store";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Loading from "~/components/Loading";
import { useEffect, useState } from "react";
import { Router } from "next/router";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Router.events.on("routeChangeStart", (url) => {
      setIsLoading(true);
    });

    Router.events.on("routeChangeComplete", (url) => {
      setIsLoading(false);
    });

    Router.events.on("routeChangeError", (url) => {
      setIsLoading(false);
    });
  }, [Router]);

  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        {isLoading && <Loading />}
        <Component {...pageProps} />
      </SessionProvider>
    </Provider>
  );
};

export default api.withTRPC(MyApp);
