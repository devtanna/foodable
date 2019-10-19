import Layout from './Layout';

const Static = props => (
  <Layout>
    <div className="mainWrapper">{props.children}</div>
    <style jsx>{`
      .mainWrapper {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        background: #fff;
        padding: 20px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
      }
    `}</style>
  </Layout>
);

export default Static;
