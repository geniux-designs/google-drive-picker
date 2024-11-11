/**
 * Script to be injected into the document.
 */
export type ScriptConfig = {
    /** A unique identifier for the script to prevent duplicate injections */
    id: string;
    /** The source URL of the script */
    src: string;
    /** Whether the script should be loaded asynchronously */
    async?: boolean;
    /** Whether the script should be deferred until after parsing */
    defer?: boolean;
    /** Additional attributes to set on the script tag */
    attributes?: { [key: string]: string };
};