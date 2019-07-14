import React, { Fragment, useEffect } from 'react';
import Static from '../components/Static';
import Head from 'next/head';
import { trackPageView } from '../helpers/utils';

const PageHead = () => (
  <Head>
    <title>Terms & Conditions | Foodable.ae</title>
    <meta name="description" content="Terms & Conditions at Foodable" />
  </Head>
);

const Terms = () => {
  useEffect(() => {
    trackPageView('terms', '/terms');
  }, []);

  return (
    <Fragment>
      <PageHead />
      <Static>
        <h2>Terms and Conditions</h2>

        <h3>Welcome to Foodable!</h3>
        <p>
          Please read these Terms of Use carefully before using the website and
          services offered by Foodable. They set forth the legally binding
          Agreement for your use of the website at http://www.foodable.ae (the
          “website”) and all services provided by Foodable.
        </p>

        <h3>TL;DR</h3>
        <ul>
          <li>
            Foodable only acts as a search and comparison site for food deals
            and offers provided to us by many different online food delivery and
            ordering sites.
          </li>
          <li>
            Foodable does not handle food ordering or deliveries, we only link
            ours users to the food delivery site hosting the deal.
          </li>
          <li>
            Foodable keeps the right to remove any listing not complying with
            the UAE law or against our Terms and Conditions (see below).
          </li>
          <li>
            Foodable keeps the right to update the following Terms and
            Conditions. In case any change will be introduced it will be
            properly communicated to the existing users.
          </li>
        </ul>

        <h3>The boring version</h3>
        <h3>1. General Terms &amp; Conditions</h3>
        <p>
          By using the website in any manner, including but not limited to
          visiting or browsing the website, you (the "user" or "you") agree to
          be bound by these terms of use, which constitute an agreement between
          you and Foodable, including those additional terms and conditions and
          policies referenced herein and/or available by hyperlink. This
          agreement applies to all users of the website, including without
          limitation users who are vendors/sellers, customers/buyers, merchants,
          contributors of content, information and other materials or services
          on the website. If you do not accept and agree to be bound by these
          terms of use, you must not register yourself on the website and
          refrain from using the services offered by Foodable.
        </p>
        <p>
          You agree that the fact that these terms of use are in electronic
          format does not affect in any way their validity or enforce ability.
        </p>
        <p>
          These terms of use help to ensure a safe and reliable marketplace for
          buyers and sellers. If you have any questions, please contact us.
        </p>

        <h3>2. Alteration of terms</h3>
        <p>
          Foodable reserves the right to update, supplement and/or amend these
          terms of use at any time without the need to provide prior notice.
          Amended terms of use posted on the website will be effective
          immediately. You are responsible for ensuring that you are familiar
          with the latest terms of use. Continuing to use the website represents
          your acceptance of the terms of use as amended.
        </p>

        <h3>3. Intellectual Property</h3>

        <p>
          We reserve all our intellectual property rights with respect to the
          website and the services.
        </p>
        <p>
          This website contains registered and other intellectual property
          rights belonging to Foodable and you shall not reverse engineer or
          otherwise attempt to discover any source code contained in the website
          or any software or database connected to the website.
        </p>
        <p>
          Except with our prior written approval, we do not authorize the grant
          of any license or right to use any of our intellectual property
          rights.
        </p>
        <p>
          You may view the website and electronically copy or print hard copies
          or parts of the website for your personal, non-commercial use only.
          You may not distribute, reproduce, sell, lease, rent, sub license,
          encumber, display, publish or otherwise commercialize any aspect of
          the website or its content.
        </p>

        <h3>4. Your use of the website</h3>
        <p>
          While using the website, you agree not to interfere with or attempt to
          interfere with the proper working of the website or any transaction
          being conducted on the website or to gain unauthorized access to any
          part of the website.
        </p>
        <p>
          We reserve the right to establish such limitations as we may deem
          appropriate, at our sole discretion, with respect to your usage of the
          website and such limitations may include but will not be limited to,
          limitations regarding the period of time that any listed content may
          remain on the website as well as the number of listed items and the
          file size of such listed items.
        </p>

        <h3>5. Linked websites</h3>
        <p>
          This website may contain links to third party websites for your
          convenience only and do not indicate an endorsement by Foodable of
          those sites or the products/services offered on those sites.
        </p>
        <p>
          You acknowledge that we have no control over any aspect of those third
          party websites, that we take no responsibility for the content or use
          of those sites and, that you enter linked websites at your own risk.
        </p>

        <h3>6. Disclaimer</h3>
        <p>
          We are providing the website on an 'as is' basis and make no
          representations or warranties of any kind with respect to the website
          or its contents and we disclaim all such representations and
          warranties. We are not responsible to you or anybody else for any loss
          incurred in relation to your use of this website. Your use of this
          site website is at your own risk.
        </p>
        <p>
          We do not warrant that your use of the website will be uninterrupted
          or free from defects and viruses or that the information provided will
          be current. We are not liable to you or anyone else if your computer
          system is in any way damaged or affected by your use of this website.
        </p>
      </Static>
    </Fragment>
  );
};

export default Terms;
