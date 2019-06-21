import Router from 'next/router';
import { TRACKING_ID } from './constants';

export const redirectToPage = (res, page) => {
  if (res) {
    res.writeHead(302, {
      Location: page,
    });
    res.end();
  } else {
    Router.push(page);
  }
};

export const trackPageView = (
  page_title = null,
  page_location = null,
  page_path = null
) => {
  try {
    window.gtag('config', TRACKING_ID, {
      page_title,
      page_location,
      page_path,
    });
  } catch (error) {
    console.log('Tracking error:', error);
  }
};

export const trackEvent = (
  action,
  event_category = null,
  event_label = null,
  value = null
) => {
  try {
    window.gtag('event', action, {
      event_category,
      event_label,
      value,
    });
  } catch (error) {
    console.log('Tracking error:', error);
  }
};
