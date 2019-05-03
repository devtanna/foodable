import React, { Fragment, useState } from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';
import 'semantic-ui-css/semantic.min.css';
import { AppProvider } from '../helpers/contexts';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', (err, url) => {
  NProgress.done();
  toast.error("Page doesn't exist");
});

const PageHead = () => (
  <Head>
    <title>Foodable.com</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    <link rel="icon" href="/static/favicon.png" />
    <link rel="stylesheet" href="/static/nprogress.css" />
    <link rel="stylesheet" href="/static/ReactToastify.min.css" />
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
      </Fragment>
    )
  }
}

export default FoodableApp;
