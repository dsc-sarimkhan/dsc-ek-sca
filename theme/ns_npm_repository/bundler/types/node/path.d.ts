declare module "path" {
    namespace path {
        interface PlatformPath {
            resolve(...pathSegments: string[]): string;
            extname(p: string): string;
            basename(p: string, ext?: string): string;
        }
    }
    const path: path.PlatformPath;
    export = path;
}
