/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import Joi from "joi";
import { NextApiRequest, NextApiResponse } from "next";
import { ServerError } from "../../../components/ServerError";
import { UserModel } from "../../../models/ServerUserModel";
import { IUser } from "../../../models/UserTypes";

function validatePutUser(req: NextApiRequest, res: NextApiResponse): IUser {
    const body = req.body;
    body.nameSlug = req.query.slug;
    const schema = Joi.object({
        nameSlug: Joi.string().min(3).required(),
        caughtFamilyIDs: Joi.array().items(Joi.string()).required(),
    });
    const { value, error } = schema.validate(body);
    if (error) {
        throw new ServerError(422, "Validation Error", error.details);
    }

    return {
        ...value,
        version: 1,
    };
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const nameSlug: string = req.query.slug as string;

    try {
        const userModel = new UserModel();
        switch (req.method?.toLowerCase()) {
            case "get": {
                const user = await userModel.get(nameSlug);
                if (!user) {
                    throw new ServerError(404, "User Not Found.");
                }

                res.statusCode = 200;
                res.json(user);
                break;
            }
            case "put": {
                const userInput = validatePutUser(req, res);
                const user = await userModel.create(userInput);
                res.statusCode = 200;
                res.json(user);
                break;
            }
        }
    } catch (error) {
        if (error instanceof ServerError) {
            res.statusCode = error.statusCode;
        } else {
            res.statusCode = 500;
        }
        res.json(error);
    }
};
