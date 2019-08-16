import React, { Fragment, useEffect } from 'react';
import Static from '../components/Static';
import Head from 'next/head';
import { trackPageView } from '../helpers/utils';

const PageHead = () => (
  <Head>
    <title>Privacy Policy | Foodable.ae</title>
    <meta name="description" content="Privacy Policy at Foodable" />
  </Head>
);

const PrivacyPolicy = () => {
  useEffect(() => {
    trackPageView('privacy policy', '/privacy-policy/');
  }, []);

  return (
    <Fragment>
      <PageHead />
      <Static>
        <div className="listWrapper">
          <ul className="ui link list">
            <li role="listitem">
              <a href="#policy">Privacy Policy</a>
            </li>
            <li role="listitem">
              <a href="#information-collect">Notice of Information We Collect or Track</a>
            </li>
            <li role="listitem">
              <a href="#information">Notice of How We Use Collected/Tracked Information</a>
            </li>
            <li role="listitem">
              <a href="#information-disclosure">Notice of Disclosure of Collected/Tracked Information</a>
            </li>
            <li role="listitem">
              <a href="#information-personal">Changes to personal information</a>
            </li>
            <li role="listitem">
              <a href="#cookies">Cookies / Tracking Technologies</a>
            </li>
          </ul>
          <ul className="ui link list">
            <li role="listitem">
              <a href="#links">Links</a>
            </li>
            <li role="listitem">
              <a href="#children">Age Restrictions; Children's Privacy</a>
            </li>
            <li role="listitem">
              <a href="#choice">Choice / Opt. Out</a>
            </li>
            <li role="listitem">
              <a href="#security">Security</a>
            </li>
            <li role="listitem">
              <a href="#contact">Contact Us</a>
            </li>
            <li role="listitem">
              <a href="#effective">Effective Date</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 id="policy">Privacy Policy</h2>

          <p>
            This Privacy Policy ("Policy") covers how Foodable treats personal information, tracks or collects in
            connection with your use of{' '}
            <a href="http://foodable.ae/" target="_blank">
              http://foodable.ae
            </a>{' '}
            ("Site") and any applications created and available through or in connection with social networks
            (collectively, the "Services").
          </p>
          <p>
            This Policy tells you, among other things, what information we gather from you through our Services, how we
            may use or disclose that information, how to review or edit it, and our efforts to protect it.
          </p>
          <p>
            Please read this Policy carefully. By registering for, accessing, using, and/or downloading any Services,
            you agree to this Policy. Among other things, you consent to the collection, tracking and use of your
            personal information as outlined in this Policy, as such Policy may be amended from time to time.
          </p>
          <p>
            This Privacy Policy is separate from any policies of any social network, such as Instagram or Facebook, and
            Foodable has no control over any activities of social networks with respect to your private information
            outside of the Services. Consult the social network's privacy policy for details on how they handle such
            information.
          </p>

          <h3 id="information-collect"> 1. Notice of Information We Collect or Track.</h3>
          <p>We may collect or track the following information:</p>
          <ol>
            <li>
              <u>Registration Information</u>. When you register for Foodable Services, we will request certain
              information from you, including your contact information (such as name, address, and phone number), email
              address, etc.
            </li>
            <li>
              <u>Interaction With Services and Access</u>. As is true of most websites, we gather certain information
              automatically when you interact with the Services. We may also receive information from the mobile phone,
              tablet, computer or other device that you use to access the Services. This information may include, but is
              not limited to, your domain and/or Internet Protocol ("IP") addresses, browser type, Internet Service
              Provider ("ISP"), the referring or exiting website address, operating system, access times and history,
              information relating to your activities and preferences on the Services, geo-location, device, telephone
              number, mobile carrier, language, images or other content users post, content users download,
              communications on the Services with other users, posts in public forums, and information from cookies or
              other technology.
            </li>
            <li>
              <u>Do Not Track Signals</u>. We do not respond to do not track signals.
            </li>
            <li>
              <u>Correspondence</u>. If you send us personal correspondence, such as an email or letter, we may collect
              such information into a file specific to you.
            </li>
            <li>
              <u>Information Collected, Tracked or Analyzed by Third Parties</u>. We may utilize third parties to
              analyze data collected from the Services. We may permit third parties to collect personally identifiable
              information over time and across different websites.
            </li>
          </ol>

          <h3 id="information"> 2. Notice of How We Use Collected/Tracked Information.</h3>
          <p> We use the information we collect or track about you to:</p>
          <ol>
            <li>Operate, maintain, and provide to you the services, features and functionality of the Services;</li>
            <li>Help you quickly find information and prevent you from having to enter information more than once;</li>
            <li>Improve the quality and design of the Services;</li>
            <li>
              Provide customized content and services, including without limitation advertising and promotional
              information, such as targeted ads;
            </li>
            <li>Diagnose problems with the Services;</li>
            <li>Create new features, functionality, and services;</li>
            <li>
              Communicate with you, including sending you emails regarding products or services that you have liked;
            </li>
            <li>Provide customer support;</li>
            <li>Perform research and analysis on your use of the Services;</li>
            <li>Manage your account;</li>
            <li>
              Protect the security and integrity of the Services, as well as the property, rights and personal safety of
              Foodable, our users or others; and
            </li>
            <li>
              Enforce the Terms of Service, this Policy and any other agreements you have entered into with Foodable.
            </li>
          </ol>

          <h3 id="information-disclosure"> 3. Notice of Disclosure of Collected/Tracked Information.</h3>
          <ol>
            <li>
              <u>Disclaimer</u>. We cannot ensure that all of your private communications and other personal information
              will never be disclosed in ways not otherwise described in this Policy. By way of example (without
              limiting the foregoing), we may be required to disclose personal information to the government or third
              parties under certain circumstances, third parties may unlawfully intercept or access transmission of
              private communications, or users may abuse or misuse your personal information that they collect from the
              Services.
            </li>
          </ol>

          <h3 id="information-personal"> 4. Changes to personal information.</h3>
          <p>
            If your personal information changes, or if you no longer desire some or all of our Services, you may
            correct or update it by contacting us.
          </p>

          <h3 id="cookies"> 5. Cookies / Tracking Technologies. </h3>
          <p>
            {' '}
            We may use cookies, log files, clear gifs, web beacons or other technology. We may use these technologies in
            a variety of ways, including but not limited to:
          </p>
          <ol>
            <li>Providing custom, personalized content and information;</li>
            <li>
              Remembering information so that you will not have to re-enter it during your visit or the next time you
              visit the Services;
            </li>
            <li>Keeping count of return visits to our Services;</li>
            <li>Accumulating and reporting statistical information on Services usage;</li>
            <li>Determining which features users like best;</li>
            <li>Assessing the popularity and effectiveness of the Services;</li>
            <li>Determining whether and when an email was opened;</li>
            <li>Tracking sales;</li>
            <li>Facilitating commissions; and</li>
            <li>Improving our Services and creating new services.</li>
          </ol>
          <p>
            You can refuse cookies by turning them off in your browser. However, if you turn off cookies, then you may
            not be able to utilize certain features of the Services.
          </p>
          <p>
            This Privacy Policy covers the use of cookies by these Services only and does not cover the use of cookies
            by any advertisers or third parties.
          </p>
          <p>
            You agree Foodable is not liable for the content or use of personal information by third parties, including,
            without limitation, Content Publishers and Merchants, and including their use of cookies. You should consult
            the privacy policies and terms of service for those individual websites.
          </p>
          <p>
            By agreeing to the terms of this Policy and by using our Services, you consent to the cookies referenced
            above being dropped on your web browsers and machines. In order for you to be a registered and active user
            of the Services, you must agree to accept cookies.
          </p>

          <h3 id="links">6. Links.</h3>
          <p>
            The Services may contain links to third party sites or third party applications, including advertisers.
            However, please be aware that Foodable is not responsible for and cannot control the terms of service or
            privacy policies of such other sites. We encourage you to be aware when you leave the Services, and to read
            the applicable agreements for each and every site or application. The Policy applies solely to these
            Services. Foodable is not responsible for and makes no representations or warranties regarding links,
            including without limitation, the content, accuracy, opinions, functionality, or services provided in such
            linked sites or applications. Inclusion of any linked site or application on the Services does not imply
            approval or endorsement by Foodable.
          </p>

          <h3 id="children">7. Age Restrictions; Children's Privacy. </h3>
          <p>
            These Services are not for use for anybody under the age of 13. By using these Services, you verify that you
            are over the age of 13 and in compliance with this provision. Foodable will not knowingly collect or use
            personal information from anyone under 13 years of age. If Foodable obtains actual knowledge that it has
            obtained personal information about a child under the age of 13, that information will be permanently
            deleted from our records.
          </p>

          <h3 id="choice">8. Choice / Opt Out.</h3>
          <p>
            You may opt out at any time by using the Opt-Out or Unsubscribe option at the bottom of most of our mass
            email communications, or by contacting us through the "Contact Us" section of the Services. You may also
            choose to delete your account at any time.
          </p>

          <h3 id="security">9. Security.</h3>
          <p>
            To protect your privacy and security, we take reasonable steps (such as requesting a unique password or
            utilizing social network credentials) to verify your identity before creating your account. The user who
            created the account is responsible for maintaining the secrecy of their unique password or social network
            credentials and account information at all times.
          </p>
          <p>
            We use what we believe to be appropriate procedures to protect information against unauthorized access and
            disclosure. However, information you elect to post on our Services, emails and other information you send to
            us are not encrypted and such transmissions cannot be considered a secure means of transmitting sensitive
            information.
          </p>
          <p>
            You should be aware of the limitations of security, authentication, encryption, and privacy measures used in
            connection with the Internet and that any information you transmit through the Services may be damaged,
            corrupted, "sniffed" and/or accessed by another person without your permission. Regardless of the
            precautions taken by you or by us, "perfect security" does not exist on the Internet. Third parties may
            unlawfully intercept or access transmissions or private communications, and other users may abuse or misuse
            your personal information that they collect from the Services. Therefore, although we work very hard to
            protect your privacy, we do not promise, and you should not expect, that your personal information or
            private communications will always remain private. We cannot ensure or warrant the ultimate security of any
            information you transmit.
          </p>

          <h3 id="contact">10. Contact Us.</h3>
          <p>
            If you have any questions or concerns regarding our privacy policy, please send us a detailed message to{' '}
            <a href="mailto:foodable.ae@gmail.com">foodable.ae@gmail.com</a> or to:
          </p>
          <address>
            <strong>Foodable.ae</strong>
            <br />
            Dubai
            <br />
            United Arab Emirates
          </address>
          <h5 id="effective">Effective date: Jul 16 2019</h5>
        </div>
        <style jsx>{`
          .listWrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-bottom: 20px;
          }
        `}</style>
      </Static>
    </Fragment>
  );
};

export default PrivacyPolicy;
