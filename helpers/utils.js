import Router from 'next/router';

export const redirectToPage = (res, page) => {
  if (res) {
    res.writeHead(302, {
      Location: page
    })
    res.end();
  } else {
    Router.push(page);
  }
};
