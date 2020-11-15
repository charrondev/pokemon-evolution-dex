/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import { UserModel } from "../../models/ServerUserModel";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userModel = new UserModel();

    try {
        // await userModel.create("test_user_1");

        // const user = await userModel.get("test_user_1");

        res.statusCode = 200;
        // res.json(user);
    } catch (error) {
        res.statusCode = 500;
        res.json(error);
    }
};
