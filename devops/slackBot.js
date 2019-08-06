const axios = require('axios');
const settings = require('../settings')();

function sendSlackMessage(msg) {
  const slackWebHook = 'https://hooks.slack.com/services/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';
  let payload = {
    text: `${msg}.\n\t\tTEST_MODE=${settings.SCRAPER_TEST_MODE}, ENV=${process.env.NODE_ENV}`,
    username: 'azure-scraper',
    icon_emoji: ':grinning:',
  };

  axios.post(slackWebHook, payload).then(res => {
    // console.log(`statusCode: ${res.statusCode}`);
    console.log('Message Sent');
  });
}

sendSlackMessage(process.argv[2]);
