// lib/partner-mailtos.ts
// Pre-built mailto links for the public footer's "Partner with PRM" row.
//
// IMPORTANT: do NOT use URLSearchParams here. URLSearchParams produces
// application/x-www-form-urlencoded output where spaces become `+`. Most
// mail clients render that `+` literally instead of as a space, which
// makes the email body look broken. mailto: bodies follow RFC 6068 +
// RFC 3986 percent-encoding rules, which require `%20` for spaces and
// `%0D%0A` (CRLF) for line breaks. encodeURIComponent gives us the
// right encoding for spaces, and we normalize newlines to CRLF before
// encoding so the rendered email has consistent line breaks across
// Apple Mail, Gmail web, Outlook, and the iOS/Android default clients.

const RECIPIENT = "jeff.cline@me.com";

export interface PartnerLink {
  label: string;
  subject: string;
  body: string;
}

interface BodyOptions {
  intro: string;
  sections: Array<{ title: string; fields: string[] }>;
  closing?: string;
}

function buildBody(opts: BodyOptions): string {
  const lines: string[] = ["Hi Jeff,", "", opts.intro, ""];
  for (const section of opts.sections) {
    lines.push(`— ${section.title.toUpperCase()} —`);
    for (const field of section.fields) {
      lines.push(`${field}: `);
    }
    lines.push("");
  }
  lines.push(opts.closing ?? "Thank you,");
  return lines.join("\n");
}

export const PARTNER_LINKS: PartnerLink[] = [
  {
    label: "Add My Excursion",
    subject: "ADD MY EXCURSION — Puerto Rico Masterminds",
    body: buildBody({
      intro:
        "I'd like to add my excursion to puertoricomasterminds.com. Here are the details:",
      sections: [
        {
          title: "Contact",
          fields: [
            "Name",
            "Phone",
            "Email",
            "Business / excursion company",
            "Website or social profile",
          ],
        },
        {
          title: "About the excursion",
          fields: [
            "Excursion name",
            "1-line description",
            "Where guests meet you",
            "Duration",
            "Max guests per trip",
            "Price per person",
            "Seasonality (year-round / specific months)",
            "Insurance + permits in place (yes / no / in progress)",
          ],
        },
        {
          title: "Why it matters",
          fields: [
            "Who is this excursion best for (cruise day, multi-day stay, residents)",
            "How do you see it impacting San Juan tourism + the PRM community",
          ],
        },
      ],
    }),
  },

  {
    label: "Add My Event",
    subject: "ADD MY EVENT — Puerto Rico Masterminds",
    body: buildBody({
      intro: "I'd like to add my event to puertoricomasterminds.com.",
      sections: [
        {
          title: "Contact",
          fields: [
            "Name",
            "Phone",
            "Email",
            "Company or organizer",
            "Website / Eventbrite / IG link",
          ],
        },
        {
          title: "About the event",
          fields: [
            "Event name",
            "Date(s) / recurring",
            "Venue + neighborhood",
            "Ticket price range",
            "Expected attendance",
            "One-off, series, or annual",
          ],
        },
        {
          title: "Why it matters",
          fields: [
            "Audience you're trying to reach",
            "How does this add to Puerto Rico's tourism story and PRM community",
          ],
        },
      ],
    }),
  },

  {
    label: "Become an Investor",
    subject: "BECOME AN INVESTOR — Puerto Rico Masterminds",
    body: buildBody({
      intro:
        "I'm interested in investing in Puerto Rico Masterminds and/or the PRM-curated experiences pipeline.",
      sections: [
        {
          title: "Contact",
          fields: [
            "Name",
            "Phone",
            "Email",
            "LinkedIn or website",
          ],
        },
        {
          title: "About me / the firm",
          fields: [
            "Investor type (angel / VC / family office / strategic / private)",
            "Typical check size",
            "Sectors of interest (excursion ops / hospitality / RE / events / tech)",
            "Geographic focus (PR-only / Caribbean / global)",
          ],
        },
        {
          title: "What's drawing you in",
          fields: [
            "What got you interested in PRM",
            "Timeline for your next investment decision",
            "How do you see this impacting Puerto Rico's economy or community",
          ],
        },
      ],
      closing: "Let's talk,",
    }),
  },

  {
    label: "Advertise on PRM",
    subject: "ADVERTISE ON PRM — Puerto Rico Masterminds",
    body: buildBody({
      intro: "I'd like to advertise on puertoricomasterminds.com.",
      sections: [
        {
          title: "Contact",
          fields: [
            "Name",
            "Phone",
            "Email",
            "Business name + website",
          ],
        },
        {
          title: "About the campaign",
          fields: [
            "What are you advertising (product / offer / experience)",
            "Target audience (cruise visitors / multi-day stayers / residents / masterminds)",
            "Campaign duration",
            "Budget range",
            "Creative ready (banner, copy, photos) — yes/no",
            "Special offer or attraction unique to PR visitors",
          ],
        },
        {
          title: "Goals",
          fields: [
            "Primary metric (clicks, leads, bookings, awareness)",
            "How do you see this impacting our community",
          ],
        },
      ],
    }),
  },

  {
    label: "Joint Venture Opportunities",
    subject: "JOINT VENTURE — Puerto Rico Masterminds",
    body: buildBody({
      intro:
        "I have a joint-venture opportunity I'd like to discuss with Puerto Rico Masterminds.",
      sections: [
        {
          title: "Contact",
          fields: [
            "Name",
            "Phone",
            "Email",
            "Company name + website",
            "LinkedIn",
          ],
        },
        {
          title: "About the opportunity",
          fields: [
            "Type of JV (revenue share / co-marketing / co-built product / equity / other)",
            "What you bring (audience, distribution, IP, capital, operations)",
            "What you're looking for from PRM",
          ],
        },
        {
          title: "Why now",
          fields: [
            "Timeline you're working on",
            "How do you see this growing Puerto Rico tourism or our community",
          ],
        },
      ],
      closing: "Looking forward,",
    }),
  },
];

export const JEFF_CONTACT: PartnerLink = {
  label: "Contact Jeff Cline",
  subject: "Hello Jeff — from puertoricomasterminds.com",
  body: buildBody({
    intro: "Reaching out from puertoricomasterminds.com.",
    sections: [
      {
        title: "Contact",
        fields: ["Name", "Phone", "Email", "Website or company"],
      },
      {
        title: "Reason for reaching out",
        fields: ["What's on your mind"],
      },
    ],
  }),
};

/**
 * Build an RFC-6068-compliant mailto: URL.
 * - encodeURIComponent encodes spaces as %20 (vs. URLSearchParams' `+`)
 * - We normalize \n → \r\n before encoding so the encoded form is %0D%0A,
 *   which every major mail client renders as a real line break.
 */
export function mailtoHref(link: PartnerLink): string {
  const subject = encodeURIComponent(link.subject);
  const body = encodeURIComponent(link.body.replace(/\n/g, "\r\n"));
  return `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;
}
