import { Box, Typography } from "@mui/material";

const sections = [
    {
        heading: "What I collect",
        body: "When you order or subscribe, I collect your name, email, and delivery address. If you join the mailing list, I keep your name and email. Card details go straight to my payment processor and are never stored by me."
    },
    {
        heading: "How I use it",
        body: "To fill and deliver your order, send confirmations, manage your subscription, and, if you signed up, email you about new flavors. Nothing else."
    },
    {
        heading: "Who I share it with",
        body: "Only the service providers needed to process payments, send email, and run the site. Information is shared with them securely and only as needed to provide those services. I don't sell or rent your information to anyone."
    },
    {
        heading: "How it's protected",
        body: "Information is encrypted in transit, access is restricted, and payments are handled by a PCI-compliant processor."
    },
    {
        heading: "Your choices",
        body: "You can unsubscribe from the mailing list or cancel your subscription anytime from the links in any email. To have your information deleted, email help@maxrosoff.com."
    }
];

const PrivacyPolicy = () => (
    <Box pb={4}>
        <Typography variant="h1">Privacy Policy</Typography>
        {sections.map((section) => (
            <Box key={section.heading} mt={3}>
                <Typography variant="h2" mb={1}>
                    {section.heading}
                </Typography>
                <Typography>{section.body}</Typography>
            </Box>
        ))}
    </Box>
);

export default PrivacyPolicy;
