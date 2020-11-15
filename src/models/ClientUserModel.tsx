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
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial userdata.
    useEffect(() => {
        // Load user data.
        const existing = localStorage.getItem(LOCAL_STORAGE_NAME);

        if (existing) {
            const existingUser: IUser = JSON.parse(existing);
            setCaughtFamilyIDs(existingUser.caughtFamilyIDs);
            setUserName(existingUser.nameSlug);
            setIsLoaded(true);
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
                    return;
                }

                if (!isLoaded) {
                    return;
                }

                localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(user));
                isDirty.current = false;
            },
            5000,
            { leading: true }
        ),
        [isLoaded]
    );

    // Stash the user when the name or IDs change.
    useEffect(() => {
        const user: IUser = {
            nameSlug: userName,
            caughtFamilyIDs: caughtFamilyIDs,
            version: 1,
        };
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

export function useRemotePersist() {
    const {
        caughtFamilyIDs,
        setCaughtFamilyIDs,
        setUserName,
        userName,
    } = useContext(clientContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingError, setLoadingError] = useState<Error | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savingError, setSavingError] = useState<Error | null>(null);

    async function persistUser(name: string) {
        setLoadingError(null);
        setIsLoading(false);
        if (name.length < 6) {
            setIsSaving(false);
            setSavingError(new Error("UserID must be at least 6 characters"));
            return;
        }

        setIsSaving(true);
        setSavingError(null);

        const slug = encodeURIComponent(name);
        const response = await fetch(`/api/users/${slug}`, {
            method: "PUT",
            body: JSON.stringify({
                nameSlug: name,
                caughtFamilyIDs,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setIsSaving(false);
        const json = await response.json();
        if (response.status !== 200) {
            setSavingError(new Error("Failed to save user"));
            console.error(json);
            return;
        }

        await loadUser(name);
    }

    async function loadUser(name: string) {
        setSavingError(null);
        setIsSaving(false);
        setLoadingError(null);
        setIsLoading(true);
        const slug = encodeURIComponent(name);
        const response = await fetch(`/api/users/${slug}`);
        if (response.status == 404) {
            setIsLoading(false);
            setLoadingError(new Error("Could not find user."));
            return null;
        }
        const json: IUser = await response.json();
        setIsLoading(false);
        if (response.status >= 400) {
            console.error("Failed to load user", json);
            setLoadingError(new Error("Failed to load user."));
            return;
        }

        setUserName(json.nameSlug);
        setCaughtFamilyIDs(json.caughtFamilyIDs);
    }

    return {
        loadUser,
        persistUser,
        loadRemote: {
            error: loadingError,
            loading: isLoading,
        },
        saveRemote: {
            error: savingError,
            loading: isSaving,
        },
        local: {
            userName,
            caughtFamilyIDs,
        },
    };
}
