import React, { Fragment, useState } from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { AppProvider } from '../helpers/contexts';
import '../static/nprogress.css';
import '../static/semantic.min.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', (err, url) => {
  NProgress.done();
  console.log(err, url);
});

const PageHead = () => (
  <Head>
    <title>Discover & compare food deals in UAE | Foodable.ae</title>
    <meta
      name="description"
      content="Compare food promotions and discover great deals and offers from top food delivery websites in United Arab Emirates (UAE). Search by restaurant name or your favorite cuisine and find great food deals in your area."
    />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
    <meta name="theme-color" content="#F66550" />
    <meta property="og:title" content="Discover & compare food deals in UAE | Foodable.ae" />
    <meta
      property="og:description"
      content="Compare food promotions and discover great deals and offers from top food delivery websites in United Arab Emirates (UAE). Search by restaurant name or your favorite cuisine and find great food deals in your area."
    />
    <meta property="og:url" content="https://foodable.ae/" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://foodable.ae/static/icon-192.png" />
    <link rel="icon" href="/static/favicon.png" />
    <link rel="manifest" href="/static/manifest.json" />
  </Head>
);

class FoodableApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <Fragment>
        <PageHead />
        <Container>
          <AppProvider>
            <Component {...pageProps} />
          </AppProvider>
        </Container>
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
          .searchBtn {
            background: linear-gradient(270deg, #f34343 18.23%, #ff7e52 100%) !important;
            color: #fff !important;
            width: 100%;
          }
          .fdbDropdown {
            font-size: 1.123em !important;
          }
          .loaderWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 200px;
            height: 200px;
            max-width: 100%;
            max-height: 100%;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default FoodableApp;
