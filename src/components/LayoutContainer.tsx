/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React from "react";
import styles from "./LayoutContainer.module.scss";

export function LayoutContainer(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={styles.container} />;
}
