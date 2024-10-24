declare const _default: () => {
    env: string;
    port: number;
    logLevel: string;
    grpc: {
        url: string;
        package: string;
        protoPath: string;
    };
    database: {
        host: string;
        port: string | number;
        name: string;
        user: string;
        password: string;
    };
    redis: {
        host: string;
        port: string | number;
        password: string;
    };
    session: {
        secret: string;
        expiresIn: number;
    };
};
export default _default;
