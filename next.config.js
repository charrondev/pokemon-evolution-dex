/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

const withTM = require("next-transpile-modules");

module.exports = withTM(["lodash-es"])({
    images: {
        domains: ["bulbapedia.bulbagarden.net", "cdn.bulbagarden.net"],
    },
});
