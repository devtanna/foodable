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

export const trackPageView = (page_title = null, page_location = null, page_path = null) => {
  if (!window.gtag) return;
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

export const trackEvent = (action, event_category = null, event_label = null, value = null) => {
  if (!window.gtag) return;
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

export const deslugify = slug => {
  var words = slug.split('-');

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }

  return words.join(' ');
};

export const removeObjEmpty = obj => {
  let _obj = Object.assign({}, obj);

  Object.keys(_obj).forEach(key => (!_obj[key] || _obj[key].length === 0 || _obj[key] === '') && delete _obj[key]);

  return _obj;
};

export const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const hideVirtualKeyboard = () => {
  if (document.activeElement && document.activeElement.blur && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
};

export const limitChars = str => {
  const limit = 70;
  if (str.length > limit) {
    str = str.substring(0, limit);
    str += '...';
  }

  return str;
};

export const showCurrency = str => str !== '?';

export const showMins = str => str.search(/pre-order/gi) < 0;
