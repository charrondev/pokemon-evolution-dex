/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import { DbClient } from "./DbClient";

export class UserModel {
    private static readonly TABLE_NAME = "dex_caught";

    private static readonly CURRENT_REVISION = 1;

    public create(name: string) {
        return DbClient.put({
            TableName: UserModel.TABLE_NAME,
            Item: {
                nameSlug: name,
                hello: "other",
            },
        }).promise();
    }

    public get(name: string) {
        return DbClient.get({
            TableName: UserModel.TABLE_NAME,
            Key: {
                nameSlug: name,
            },
        }).promise();
    }
}
