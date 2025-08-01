import { useEffect } from "react";

export default function Dashboard() {
    useEffect(() => {
        document.title = "AdsCity - Ma Boutique";
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
};
