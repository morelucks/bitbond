import { createConfig, http } from "wagmi";
import { midlRegtest } from "@midl/executor";

export const wagmiConfig = createConfig({
    chains: [midlRegtest],
    transports: {
        [midlRegtest.id]: http(midlRegtest.rpcUrls.default.http[0]),
    },
});
