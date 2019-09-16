const fs = require('fs');
var Slack = require('node-slack-upload');
const settings = require('../settings')();
var slack = new Slack(settings.SLACK_API_TOKEN);

function sendLogFile(scraperName) {
  let today = new Date();
  let d = ('0' + today.getDate()).slice(-2);
  let m = ('0' + (today.getMonth() + 1)).slice(-2);

  let filename = `/tmp/scrapers/${scraperName}.js-${new Date().getFullYear()}-${m}-${d}.log`;

  slack.uploadFile(
    {
      file: fs.createReadStream(filename),
      filetype: 'auto',
      title: `${scraperName} ${new Date().getFullYear()}-${m}-${d} Log`,
      initialComment: '',
      channels: `${settings.SLACK_LOG_BOT_CHANEL_ID}`,
    },
    function(err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log('Uploaded file details: ', data);
      }
    }
  );
}

sendLogFile(process.argv[2]);
