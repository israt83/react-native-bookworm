import cron from 'cron';
import https from 'https';

const job = new cron.CronJob('*/14 * * * *', () => {
  if (!process.env.API_URL) {
    console.log('API_URL not defined');
    return;
  }

  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log('Cron job executed successfully');
      else console.log('Cron job failed with status code:', res.statusCode);
    })
    .on('error', (err) => {
      console.log('Cron job error:', err.message);
    });
});

// Cron job start করা
job.start();

export default job;
