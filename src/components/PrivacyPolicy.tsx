import { Box, Typography } from "@mui/material";

const sections = [
    {
        heading: "What I collect",
        body: "When you order ice cream or subscribe, I collect your name, email, and delivery address. Payment details are entered directly into Stripe and never touch my servers. If you join the mailing list, I keep your name and email."
    },
    {
        heading: "How I use it",
        body: "To fill and deliver your order, calculate sales tax, send order confirmations, manage your subscription, and, if you signed up, email you about new flavors. Nothing else."
    },
    {
        heading: "Who I share it with",
        body: "Only the services that make this work: Stripe for payments and tax, Resend for email, and Amazon Web Services for hosting and storage. Information is passed to them over encrypted connections through their APIs. I don't sell or rent your information to anyone."
    },
    {
        heading: "How it's protected",
        body: "All traffic is encrypted with HTTPS. Data is stored with access restricted to me, API keys are kept in a secrets store rather than in code, and card numbers are handled entirely by Stripe, which is PCI compliant."
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
