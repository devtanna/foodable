import React, { Fragment } from 'react';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { AppProvider } from '../helpers/contexts';
import 'nprogress/nprogress.css';
import 'semantic-ui-css/semantic.min.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', (err, url) => {
  NProgress.done();
  console.log(err, url);
});

const PageHead = () => (
  <Head>
    <title>Food Delivery Deals & Offers | Foodable.ae | Discover & Compare</title>
    <meta
      name="description"
      content="Up to 50% discounts and BOGO offers, Foodable.ae will help you save money and time! Compare food delivery promotions and discover great deals and offers from top food delivery websites in UAE. Search by restaurant name or your favorite cuisine and find great food delivery deals in your area."
    />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
    <meta name="theme-color" content="#F66550" />
    <meta property="og:title" content="Food Delivery Deals & Offers | Foodable.ae | Discover & Compare" />
    <meta
      property="og:description"
      content="Up to 50% discounts and BOGO offers, Foodable.ae will help you save money and time! Compare food delivery promotions and discover great deals and offers from top food delivery websites in UAE. Search by restaurant name or your favorite cuisine and find great food delivery deals in your area."
    />
    <meta name="google-site-verification" content="_d2liYw_0AXsXzR4sVt3jObgk7yaDv6O0ICp3GzzmTM" />
    <meta property="og:url" content="https://foodable.ae/" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://foodable.ae/static/icon-512.png" />
    <link rel="shortcut icon" href="/static/favicon.png" />
    <link rel="manifest" href="/static/manifest.json" />
  </Head>
);

class FoodableApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Fragment>
        <PageHead />
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
        <style jsx global>{`
          #__next {
            height: 100%;
          }
          input,
          button,
          select,
          .ui.fluid.dropdown {
            border-radius: 0 !important;
          }
          .loaderWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 120px;
            height: 120px;
            max-width: 100%;
            max-height: 100%;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default FoodableApp;
