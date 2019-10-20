import React, { Fragment, useEffect } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import { trackPageView } from '../helpers/utils';

const breadcrumbs = [
  { key: 'Home', content: 'Home', href: '/' },
  { key: 'AboutUs', content: 'About Us', active: true },
];

const PageHead = () => (
  <Head>
    <title>About Us | Foodable.ae</title>
    <meta name="description" content="About Us at Foodable" />
  </Head>
);

const AboutUs = () => {
  useEffect(() => {
    trackPageView('about us', '/about-us');
  }, []);

  return (
    <Fragment>
      <PageHead />
      <Layout isStatic={true} breadcrumbs={breadcrumbs}>
        <h2>About Foodable</h2>

        <p>
          Founded in 2019 and based in Dubai, UAE, Foodable is a search and comparison site for food deals and offers
          provided to us by many different online food delivery and ordering sites.
        </p>
        <p>
          We aim to present food deals in one place and seek to offer value to our users by allowing them to be informed
          of these deals and offers. Foodable's listings are simply links to the food delivery site which is hosting the
          deal, we do not handle ordering, we simply present our users with information.
        </p>
      </Layout>
    </Fragment>
  );
};

export default AboutUs;
