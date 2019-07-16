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
    <title>Discover & compare great food deals in UAE | Foodable.ae</title>
    <meta
      name="description"
      content="Compare food promotions and discover great deals from top food delivery websites. Search by restaurant name or your favorite cuisine and find great food deals in your area."
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=5"
    />
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
            background: linear-gradient(
              270deg,
              #f34343 18.23%,
              #ff7e52 100%
            ) !important;
            color: #fff !important;
            width: 100%;
          }
          .fdbDropdown {
            font-size: 1.123em !important;
          }
        `}</style>
      </Fragment>
    );
  }
}

export default FoodableApp;
