const axios = require('axios');
const settings = require('../settings')();

function sendSlackMessage(msg) {
  if (msg && msg.length > 5) {
    const slackWebHook = '';
    let payload = {
      text: msg,
      username: 'azure-scraper',
      icon_emoji: ':information_source:',
    };

    axios.post(slackWebHook, payload).then(res => {
      console.log('Message Sent');
    });
  }
}

sendSlackMessage(process.argv[2]);

module.exports = {
  sendSlackMessage,
};
