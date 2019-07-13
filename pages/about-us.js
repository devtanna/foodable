import React, { Fragment } from 'react';
import Static from '../components/Static';
import Head from 'next/head';

const PageHead = () => (
  <Head>
    <title>About Us | Foodable.ae</title>
    <meta name="description" content="About Us at Foodable" />
  </Head>
);

const AboutUs = () => (
  <Fragment>
    <PageHead />
    <Static>
      <h2>About Foodable</h2>

      <p>
        Founded in 2019 and based in Dubai, UAE, Foodable is a search and
        comparison site for food deals and offers provided to us by many
        different online food delivery and ordering sites.
      </p>
      <p>
        We aim to present food deals in one place and seek to offer value to our
        users by allowing them to be informed of these deals and offers.
        Foodable's listings are simply links to the food delivery site which is
        hosting the deal, we do not handle ordering, we simply present our users
        with information.
      </p>
    </Static>
  </Fragment>
);

export default AboutUs;
