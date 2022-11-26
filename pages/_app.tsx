import type { AppProps } from "next/app";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Router from "next/router";
import Link from "next/link";

Router.events.on("routeChangeStart", () => {
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => {
  NProgress.done();
});
Router.events.on("routeChangeError", () => {
  NProgress.done();
});

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <div>
      {router.route !== "/" && <Link href="/">&larr; Go back</Link>}
      <Component {...pageProps} />
    </div>
  );
}
