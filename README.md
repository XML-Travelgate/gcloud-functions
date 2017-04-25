# Google Cloud Functions Node.js

Looks between the given date and loop over X-days and combine multiple CSV files in one.
The format of files should be something like:
- `Billing_account-2017-06-02.csv`


Both functions are have a few fields to be send:
- Days (optional): By default will take 30 days
- Date (optional): It takes today date if none is passed.  Format: `YYYY-MM-DD`
- BucketName (Mandatory): Bucket Name
- Prefix (Mandatory): Name of the file we're looking of without date. Ex: `billing_account-`

1. `combineFiles` Combine multiple csv files from bucket using `bucket.combine()`, make it public and stream the content.
2. `appendFilesV2` Combine on stream multiple CSV without concatening the headers.
