/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import { AWSError } from "aws-sdk";
import { ServerError } from "../components/ServerError";
import { DbClient } from "./DbClient";
import { IUser } from "./UserTypes";

export class UserModel {
    private static readonly TABLE_NAME = "dex_caught";

    public async create(user: IUser): Promise<IUser | null> {
        const response = await DbClient.put({
            TableName: UserModel.TABLE_NAME,
            Item: user,
        }).promise();
        const { data, error } = response.$response;
        if (error) {
            throw ServerError.fromAWS(error);
        }

        return this.get(user.nameSlug);
    }

    public async get(name: string): Promise<IUser | null> {
        const response = await DbClient.get({
            TableName: UserModel.TABLE_NAME,
            Key: {
                nameSlug: name,
            },
        }).promise();

        const { data, error } = response.$response;
        if (error) {
            throw ServerError.fromAWS(error);
        }

        if (!data) {
            throw new ServerError(404, "User not found.");
        }

        return data.Item as IUser;
    }
}
