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

export const slugify = string => {
  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
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
