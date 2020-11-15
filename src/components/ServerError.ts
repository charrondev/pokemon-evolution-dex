/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import { AWSError } from "aws-sdk";

export class ServerError extends Error {
    public constructor(
        public statusCode: number,
        public message: string,
        public details: Record<any, any> = {}
    ) {
        super();
        this.message = message;
    }

    public static fromAWS(error: AWSError): ServerError {
        return new ServerError(error.statusCode ?? 500, error.message, error);
    }

    public toJSON() {
        return {
            message: this.message,
            details: this.details,
        };
    }
}
