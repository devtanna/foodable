// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document';
import { Fragment } from 'react';
import { TRACKING_ID } from '../helpers/constants';

const API_KEY = 'AIzaSyBqt7-8jO2YC1F9iRTbolj6KA3AP-n9-mM';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const isProduction = process.env.NODE_ENV === 'production';
    return { ...initialProps, isProduction };
  }

  setGoogleTags() {
    return {
      __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${TRACKING_ID}');
      `,
    };
  }

  setAntiFlicker() {
    return {
      __html: `
        (function(a,s,y,n,c,h,i,d,e){s.className+=' '+y;h.start=1*new Date;
        h.end=i=function(){s.className=s.className.replace(RegExp(' ?'+y),'')};
        (a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;
        })(window,document.documentElement,'async-hide','dataLayer',2000,
        {'${TRACKING_ID}':true});
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
              <script dangerouslySetInnerHTML={this.setAntiFlicker()} />
              <script defer dangerouslySetInnerHTML={this.setGoogleTags()} />
            </Fragment>
          )}
          <script src={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}`} type="text/javascript" />
          <script src="https://feedier.com/js/widgets/widgets.min.js" type="text/javascript" async />
        </Head>
        <body className="custom_class">
          <Main />
          <NextScript />
          <style jsx global>{`
            .async-hide {
              opacity: 0 !important;
            }
          `}</style>
        </body>
      </html>
    );
  }
}

export default MyDocument;
