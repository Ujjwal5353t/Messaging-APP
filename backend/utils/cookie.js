export const getCookieOptions = (req) => {
    const userAgent = req.headers["user-agent"] || "";
    const isElectron = userAgent.includes("Electron");
    
    return {
        httpOnly: true,
        secure: isElectron || process.env.NODE_ENV === 'production',
        sameSite: isElectron ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
};

export const getClearCookieOptions = (req) => {
    const userAgent = req.headers["user-agent"] || "";
    const isElectron = userAgent.includes("Electron");
    
    return {
        httpOnly: true,
        secure: isElectron || process.env.NODE_ENV === 'production',
        sameSite: isElectron ? 'none' : 'strict',
    };
};
