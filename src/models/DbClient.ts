/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import aws from "aws-sdk";

const DbClient = new aws.DynamoDB.DocumentClient({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "us-east-2",
});

export { DbClient };
