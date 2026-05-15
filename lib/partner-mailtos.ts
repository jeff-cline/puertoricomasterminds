// lib/partner-mailtos.ts
// Pre-built mailto links for the public footer's "Partner with PRM" row.
// Each link opens the user's mail client with the subject + a guided body
// of relevant questions so leads arrive structured.

const RECIPIENT = "jeff.cline@me.com";

export interface PartnerLink {
  label: string;
  subject: string;
  body: string;
}

function buildBody(lines: string[]): string {
  return lines.join("\n");
}

export const PARTNER_LINKS: PartnerLink[] = [
  {
    label: "Add My Excursion",
    subject: "ADD MY EXCURSION — Puerto Rico Masterminds",
    body: buildBody([
      "Hi Jeff,",
      "",
      "I'd like to add my excursion to puertoricomasterminds.com.",
      "",
      "— Contact —",
      "Name: ",
      "Phone: ",
      "Email: ",
      "Business / excursion company name: ",
      "Website or social profile: ",
      "",
      "— About the excursion —",
      "Excursion name + 1-line description: ",
      "Where guests meet you: ",
      "Duration: ",
      "Capacity (max guests per trip): ",
      "Price per person: ",
      "Seasonality (year-round or specific months): ",
      "Insurance + permits in place (yes / no / in progress): ",
      "",
      "— Why it matters —",
      "Who is this excursion best for (cruise day, multi-day stay, residents, families): ",
      "How do you see this impacting San Juan tourism and the PRM community: ",
      "",
      "Thank you,",
    ]),
  },
  {
    label: "Add My Event",
    subject: "ADD MY EVENT — Puerto Rico Masterminds",
    body: buildBody([
      "Hi Jeff,",
      "",
      "I'd like to add my event to puertoricomasterminds.com.",
      "",
      "— Contact —",
      "Name: ",
      "Phone: ",
      "Email: ",
      "Company / organizer: ",
      "Website, Eventbrite, or IG link: ",
      "",
      "— About the event —",
      "Event name: ",
      "Date(s) / recurring: ",
      "Venue + neighborhood: ",
      "Ticket price range: ",
      "Expected attendance: ",
      "Is this a one-off, a series, or annual: ",
      "",
      "— Why it matters —",
      "Audience you're trying to reach: ",
      "How does this add to Puerto Rico's tourism story / our community: ",
      "",
      "Thanks,",
    ]),
  },
  {
    label: "Become an Investor",
    subject: "BECOME AN INVESTOR — Puerto Rico Masterminds",
    body: buildBody([
      "Hi Jeff,",
      "",
      "I'm interested in investing in Puerto Rico Masterminds and/or the PRM-curated experiences pipeline.",
      "",
      "— Contact —",
      "Name: ",
      "Phone: ",
      "Email: ",
      "LinkedIn or website: ",
      "",
      "— About me / the firm —",
      "Investor type (angel / VC / family office / strategic / private): ",
      "Typical check size: ",
      "Sectors of interest (excursion ops / hospitality / real estate / events / tech): ",
      "Geographic focus (PR-only / Caribbean / global): ",
      "",
      "— What's drawing you in —",
      "What got you interested in PRM: ",
      "Timeline for your next investment decision: ",
      "How do you see this impacting Puerto Rico's economy or community: ",
      "",
      "Let's talk,",
    ]),
  },
  {
    label: "Advertise on PRM",
    subject: "ADVERTISE ON PRM — Puerto Rico Masterminds",
    body: buildBody([
      "Hi Jeff,",
      "",
      "I'd like to advertise on puertoricomasterminds.com.",
      "",
      "— Contact —",
      "Name: ",
      "Phone: ",
      "Email: ",
      "Business name + website: ",
      "",
      "— About the campaign —",
      "What are you advertising (product / offer / experience): ",
      "Target audience (cruise visitors / multi-day stayers / island residents / masterminds): ",
      "Campaign duration: ",
      "Budget range: ",
      "Do you have creative ready (banner, copy, photos): ",
      "Special offer or attraction unique to PR visitors: ",
      "",
      "— Goals —",
      "Primary metric (clicks, leads, bookings, awareness): ",
      "How do you see this impacting our community: ",
      "",
      "Thanks,",
    ]),
  },
  {
    label: "Joint Venture Opportunities",
    subject: "JOINT VENTURE — Puerto Rico Masterminds",
    body: buildBody([
      "Hi Jeff,",
      "",
      "I have a joint-venture opportunity I'd like to discuss with Puerto Rico Masterminds.",
      "",
      "— Contact —",
      "Name: ",
      "Phone: ",
      "Email: ",
      "Company name + website: ",
      "LinkedIn: ",
      "",
      "— About the opportunity —",
      "Type of JV (revenue share / co-marketing / co-built product / equity / other): ",
      "What you bring to the table (audience, distribution, IP, capital, operations): ",
      "What you're looking for from PRM: ",
      "",
      "— Why now —",
      "Timeline you're working on: ",
      "How do you see this growing Puerto Rico tourism or our community: ",
      "",
      "Looking forward,",
    ]),
  },
];

export const JEFF_CONTACT: PartnerLink = {
  label: "Contact Jeff Cline",
  subject: "Hello Jeff — from puertoricomasterminds.com",
  body: buildBody([
    "Hi Jeff,",
    "",
    "Reaching out from puertoricomasterminds.com.",
    "",
    "Name: ",
    "Phone: ",
    "Email: ",
    "Website / company: ",
    "What's on your mind: ",
    "",
    "Thanks,",
  ]),
};

export function mailtoHref(link: PartnerLink): string {
  const qs = new URLSearchParams({ subject: link.subject, body: link.body });
  return `mailto:${RECIPIENT}?${qs.toString()}`;
}
