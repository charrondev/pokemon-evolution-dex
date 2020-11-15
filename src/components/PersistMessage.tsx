/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React, { useEffect, useState } from "react";
import { useRemotePersist } from "../models/ClientUserModel";
import styles from "./PersistMessage.module.scss";

interface IProps {}

export function PersistMessage(props: IProps) {
    const {
        persistUser,
        loadUser,
        local,
        saveRemote,
        loadRemote,
    } = useRemotePersist();

    const [inputName, setInputName] = useState(local.userName);

    useEffect(() => {
        setInputName(local.userName);
    }, [local.userName]);

    const errors = [saveRemote.error, loadRemote.error];
    const isLoading = saveRemote.loading || loadRemote.loading;

    return (
        <div className={styles.textContent}>
            <h2>Remote Storage</h2>
            <p>
                You can backup your saved users to my remote storage to access
                them on another device.
            </p>
            <p>
                Pick a unique and either save or load the remote data. Make sure
                it's unique of you may mix yourself up with another user!
            </p>
            <div className={styles.row}>
                <label className={styles.inputWrap}>
                    <span className={styles.inputLabel}>UserID</span>
                    <input
                        className={styles.input}
                        type="text"
                        value={inputName}
                        minLength={3}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="A11A11"
                    />
                </label>
                <button
                    disabled={isLoading}
                    className={styles.button}
                    type="button"
                    onClick={() => {
                        persistUser(inputName);
                    }}
                >
                    Save
                </button>
                <button
                    disabled={isLoading}
                    className={styles.button}
                    type="button"
                    onClick={() => {
                        loadUser(inputName);
                    }}
                >
                    Load
                </button>
            </div>
            {errors && (
                <div>
                    {errors.map((error, i) => {
                        return (
                            <div role="error" key={i} className={styles.error}>
                                {error?.message}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
