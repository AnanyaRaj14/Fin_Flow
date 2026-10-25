const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/cf-dist.json', 'utf8'));
const etag = raw.ETag;
const config = raw.DistributionConfig;

config.DefaultCacheBehavior.FunctionAssociations = {
  Quantity: 1,
  Items: [
    {
      FunctionARN: 'arn:aws:cloudfront::838885265032:function/finflow-url-rewrite',
      EventType: 'viewer-request',
    },
  ],
};

fs.writeFileSync('scratch/cf-config-updated.json', JSON.stringify(config, null, 2));
console.log('Updated config written. ETag is:', etag);
