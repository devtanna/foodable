// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document';
import { Fragment } from 'react';
import { TRACKING_ID } from '../helpers/constants';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const isProduction = process.env.NODE_ENV === 'production';
    return { ...initialProps, isProduction };
  }

  setGoogleTags() {
    return {
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', "${TRACKING_ID}", { 'send_page_view': false });
      `,
    };
  }

  render() {
    const { isProduction } = this.props;
    return (
      <html lang="en">
        <Head>
          {isProduction && (
            <Fragment>
              <script defer src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`} />
              <script defer dangerouslySetInnerHTML={this.setGoogleTags()} />
              <script>
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:1532771,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              </script>
            </Fragment>
          )}
        </Head>
        <body className="custom_class">
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default MyDocument;
