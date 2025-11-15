import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../../App";
import axios from "axios";

const Return = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState("");

    useEffect(() => {
        const fetchSessionStatus = async () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const sessionId = urlParams.get("session_id");

            const result = await axios.post(`${API_URL}/checkout-return`, { sessionId });
            setStatus(result.data.status);
            setCustomerEmail(result.data.customer_email);
        };
        void fetchSessionStatus();
    }, []);

    if (status === "open") {
        return <Navigate to="/ice-cream/checkout" />;
    }

    if (status === "complete") {
        return (
            <section id="success">
                <p>
                    We appreciate your business! A confirmation email will be sent to{" "}
                    {customerEmail}. If you have any questions, please email{" "}
                    <a href="mailto:help@ice-cream.maxrosoff.com">help@ice-cream.maxrosoff.com</a>.
                </p>
            </section>
        );
    }
    return null;
};

export default Return;
