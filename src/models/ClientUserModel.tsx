/**
 * @copyright 2020 Adam (charrondev) Charron
 * @license Proprietary
 */

import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { IUser } from "./UserTypes";
import { throttle } from "lodash-es";

const LOCAL_STORAGE_NAME = "currentUser";

const clientContext = React.createContext<{
    userName: string;
    caughtFamilyIDs: string[];
    setUserName: (userName: string) => void;
    setCaughtFamilyIDs: (ids: string[]) => void;
}>(null as any);

export function ClientUserContext(props: { children: React.ReactNode }) {
    const isDirty = useRef(false);
    const [userName, setUserName] = useDirtyState("", isDirty);
    const [caughtFamilyIDs, setCaughtFamilyIDs] = useDirtyState<string[]>(
        [],
        isDirty
    );

    // Load initial userdata.
    useEffect(() => {
        // Load user data.
        const existing = localStorage.getItem(LOCAL_STORAGE_NAME);

        if (existing) {
            const existingUser: IUser = JSON.parse(existing);
            setCaughtFamilyIDs(existingUser.caughtFamilyIDs);
            setUserName(existingUser.nameSlug);
        }
    }, [setCaughtFamilyIDs, setUserName]);

    // Debounced stashing of user to localstorage.
    const stashUser = useCallback(
        throttle(
            (user: IUser) => {
                if (!process.browser) {
                    return;
                }

                if (!isDirty.current) {
                    console.log("not dirty, not setting");
                    return;
                }

                console.log("persisting storage");
                localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(user));
            },
            5000,
            { leading: true }
        ),
        []
    );

    // Stash the user when the name or IDs change.
    useEffect(() => {
        const user: IUser = {
            nameSlug: userName,
            caughtFamilyIDs: caughtFamilyIDs,
            version: 1,
        };
        console.log("Running change effect");
        stashUser(user);
    }, [userName, caughtFamilyIDs]);

    return (
        <clientContext.Provider
            value={{
                userName,
                setUserName,
                caughtFamilyIDs,
                setCaughtFamilyIDs,
            }}
            children={props.children}
        />
    );
}

function useDirtyState<T>(
    initial: T,
    dirtyRef: React.MutableRefObject<boolean>
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, _setter] = useState<T>(initial);
    const actualSetter: any = useCallback(
        (val: T) => {
            _setter(val);
            dirtyRef.current = true;
            console.log("setting dirty");
        },
        [_setter, dirtyRef]
    );
    return [value, actualSetter];
}

export function usePokemonCaught() {
    const { caughtFamilyIDs, setCaughtFamilyIDs } = useContext(clientContext);
    function setPokemonCaught(familyID: string, caught: boolean = true) {
        const set = new Set(caughtFamilyIDs);
        if (caught) {
            set.add(familyID);
        } else {
            set.delete(familyID);
        }
        setCaughtFamilyIDs(Array.from(set));
    }

    function isPokemonCaught(familyID: string): boolean {
        return caughtFamilyIDs.includes(familyID);
    }

    return { setPokemonCaught, isPokemonCaught };
}
