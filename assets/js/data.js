/* ------------------------------------------------------------------
   Site content lives here so it's easy to edit without touching layout.
   Anything marked TODO is placeholder copy waiting on Jade's details.
------------------------------------------------------------------- */

// TODO: swap in Jade's real inbox. The contact form opens an email to this address.
const CONTACT_EMAIL = "jade@example.com";

// The six services. `tone` picks the card's hover color: peacock, purple or black.
const SERVICES = [
  {
    id: "copywriting",
    name: "Copywriting",
    short: "Copy",
    tone: "peacock",
    verb: "I write words that sell.",
    line: "Websites, launches, emails and captions that sound like you and get people to act.",
    about:
      "Good copy sounds like you on your best day and makes the next step obvious. I write copy that's clear enough to trust and lively enough to remember.",
    gets: ["Website copy", "Launch and campaign copy", "Email sequences and newsletters", "Social captions and ads"],
    goodFor: "Businesses with a great offer and a website that isn't pulling its weight."
  },
  {
    id: "storytelling",
    name: "Storytelling and articles",
    short: "Stories",
    tone: "purple",
    verb: "I tell stories people finish.",
    line: "Origin stories, essays, scripts, features and ghostwritten thought leadership.",
    about:
      "Every brand, founder and cause has a story nobody has told well yet. I research, interview and write it so people read to the last line, whether it's an origin story, a feature or an article with your name on top.",
    gets: ["Brand and founder origin stories", "Articles, features and blog posts", "Ghostwritten thought leadership", "Scripts for video, podcast and stage"],
    goodFor: "Founders, experts, public figures and organizations with a story worth telling."
  },
  {
    id: "strategy",
    name: "Content strategy",
    short: "Strategy",
    tone: "black",
    verb: "I plan what you post and why.",
    line: "A plan for what to say, where to say it and how often, so content stops being guesswork.",
    about:
      "Posting without a plan is exhausting. I map who you're talking to, what they need to hear and a rhythm that fits your life, then hand you a plan you can actually keep.",
    gets: ["Audience and content audits", "Content pillars and calendars", "Channel plans for social, podcast and blog", "Repurposing systems"],
    goodFor: "Creators, podcasters and small teams who are tired of wondering what to post."
  },
  {
    id: "brand",
    name: "Brand development",
    short: "Brand",
    tone: "peacock",
    verb: "I build brands from the name up.",
    line: "Voice, message and identity, built in a clear process so you always know where we're going.",
    about:
      "A brand is more than a logo. It's how you sound, what you promise and why people come back. We build it together, step by step.",
    gets: ["Brand voice and messaging guide", "Naming and taglines", "Positioning and audience profile", "Launch-ready brand story"],
    goodFor: "New businesses, rebrands and organizations that have outgrown how they describe themselves.",
    process: [
      { step: "Discover", text: "Your goals, your people, what you love and what makes you cringe." },
      { step: "Define", text: "Your promise, your audience and what sets you apart, agreed in writing." },
      { step: "Voice", text: "How you sound: the words you use and the ones you never will." },
      { step: "Build", text: "Messaging, story, taglines and guidelines in one brand guide." },
      { step: "Launch", text: "The tools and first pieces of content to show the world who you are now." }
    ]
  },
  {
    id: "editing",
    name: "Content editing",
    short: "Editing",
    tone: "purple",
    verb: "I make good drafts great.",
    line: "Structural edits, line edits and polish for anything you've already written.",
    about:
      "You did the hard part and wrote it. I tighten, clarify and keep your voice intact, so the final version is unmistakably yours, just sharper.",
    gets: ["Developmental and structural edits", "Line and copy edits", "Proofreading", "Voice consistency passes"],
    goodFor: "Writers, businesses and teams with drafts that are almost there."
  },
  {
    id: "direction",
    name: "Creative direction",
    short: "Direction",
    tone: "black",
    verb: "I direct the whole vibe.",
    line: "Concepts, shoots, campaigns and the look and feel that ties them together.",
    about:
      "You bring the goal, I bring the concept. I shape the mood, the visuals, the talent and the plan, then stay on set and in the edit so what we imagined is what you get.",
    gets: ["Campaign and shoot concepts", "Mood boards and visual direction", "On-set direction", "Performance and event creative"],
    goodFor: "Brands launching something, performers with a show to sell, and creators leveling up their look."
  }
];

// Production work lives on its own page but can still tag portfolio pieces.
const PRODUCTION = { id: "production", name: "The Color Jade Productions", tone: "jade", link: "color-jade.html" };

// TODO: confirm the services, descriptions and years for each client with Jade.
const PORTFOLIO = [
  {
    id: "sean-tucker",
    client: "Sean Tucker",
    services: ["storytelling", "strategy"],
    role: "Articles and content strategy",
    summary: "Articles written in Sean's voice, backed by a content plan that keeps them coming.",
    did: ["Wrote articles in Sean's voice", "Built the content strategy behind them", "Planned topics and publishing rhythm"]
  },
  {
    id: "top-hat",
    client: "Top Hat: A Cigar League",
    services: ["copywriting", "brand"],
    role: "Brand voice and copy",
    summary: "A voice as smooth as the product, for a league built on good company.",
    did: ["Shaped the league's brand voice", "Wrote copy for promotion and membership", "Created content for events"]
  },
  {
    id: "yaa-podcast",
    client: "You Actually Alright Podcast",
    services: ["strategy", "direction"],
    role: "Content strategy and creative direction",
    summary: "A podcast about checking in on yourself, given a plan and a look to match.",
    did: ["Planned episode and social content", "Set the creative direction", "Built a repurposing flow from episodes to posts"]
  },
  {
    id: "color-jade",
    client: "The Color Jade Productions",
    services: ["production", "direction"],
    role: "Founder and creative director",
    summary: "My own production company, where ideas become finished work.",
    did: ["Founded and built the brand", "Direct and produce client projects", "Lead concept through delivery"]
  },
  {
    id: "fierce-felines",
    client: "Fierce Felines Dance Line",
    services: ["direction", "copywriting"],
    role: "Creative direction and content",
    summary: "Energy on the field, energy on the feed.",
    did: ["Creative direction for performance content", "Wrote captions and promo copy", "Helped shape the team's identity"]
  },
  {
    id: "diamond-divas",
    client: "Diamond Divas of Indy",
    services: ["brand", "direction"],
    role: "Brand development and creative direction",
    summary: "Sparkle, turned into a brand that holds together everywhere it shows up.",
    did: ["Brand development", "Creative direction for shoots and events", "Social content"]
  },
  {
    id: "edit-me-lo",
    client: "Edit Me Lo",
    services: ["editing", "copywriting"],
    role: "Content editing and copywriting",
    summary: "Editing and copy for a brand that's all about getting the words right.",
    did: ["Content editing", "Copywriting", "Voice consistency across channels"]
  },
  {
    id: "madam-coroner",
    client: "Madam Coroner",
    subtitle: "Marion County Coroner",
    services: ["storytelling"],
    role: "Storytelling and articles",
    summary: "Telling the human story behind a public office with care and clarity.",
    did: ["Narrative writing", "Articles and features", "Public-facing messaging"]
  }
];

// Who Jade works with. Each one is a tab on work-with-jade.html.
const PEOPLE = [
  {
    id: "founders",
    label: "Founders and small businesses",
    tone: "peacock",
    feel: "You know exactly what you do. Putting it into words that make people buy is another story.",
    services: ["brand", "copywriting", "strategy"],
    leave: "A brand voice that sounds like you on your best day, and copy that turns browsers into buyers.",
    example: "Top Hat: A Cigar League"
  },
  {
    id: "creators",
    label: "Creators and podcasters",
    tone: "purple",
    feel: "You've got the ideas and the mic. What you don't have is time to plan every post or a look that ties it together.",
    services: ["strategy", "direction", "production"],
    leave: "A content plan you can actually keep, and a look people recognize before they see your name.",
    example: "You Actually Alright Podcast"
  },
  {
    id: "performers",
    label: "Performers, teams and community groups",
    tone: "black",
    feel: "Your energy is huge in person. Online, it doesn't come across the same way.",
    services: ["direction", "production", "copywriting"],
    leave: "Content that feels like the front row, and a brand that makes new members want in.",
    example: "Fierce Felines Dance Line and Diamond Divas of Indy"
  },
  {
    id: "leaders",
    label: "Thought leaders and personal brands",
    tone: "peacock",
    feel: "You have real expertise and strong opinions. You also have a calendar with no room to write.",
    services: ["storytelling", "strategy"],
    leave: "A steady stream of articles in your voice, and a reputation that grows while you do your actual job.",
    example: "Sean Tucker"
  },
  {
    id: "public",
    label: "Public offices and mission-driven organizations",
    tone: "purple",
    feel: "Your work matters, but it's complex. People need to understand it and trust you.",
    services: ["storytelling", "editing"],
    leave: "Clear, human writing that explains what you do and why it matters, without the jargon.",
    example: "Madam Coroner (Marion County Coroner)"
  },
  {
    id: "writers",
    label: "Writers and anyone with a draft",
    tone: "black",
    feel: "It's written. It's close. Something still isn't landing and you can't see it anymore.",
    services: ["editing", "storytelling"],
    leave: "The same piece, in your voice, only sharper, tighter and ready to publish.",
    example: "Edit Me Lo"
  }
];

// Font pairings Jade can try on fonts.html. The first one is the site default.
const FONT_PAIRS = [
  {
    id: "editorial",
    name: "Editorial",
    note: "High-fashion serif headlines with a clean geometric body. Polished, a little dramatic.",
    display: "Bodoni Moda", sans: "Jost", weight: 650, optical: "none",
    href: "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..800&family=Jost:wght@300..700"
  },
  {
    id: "soft-luxe",
    name: "Soft luxe",
    note: "A graceful, classic serif paired with a friendly modern sans. Elegant and warm.",
    display: "Cormorant Garamond", sans: "Manrope", weight: 700,
    href: "family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=Manrope:wght@300..800"
  },
  {
    id: "warm-modern",
    name: "Warm modern",
    note: "A rounded, characterful serif with a crisp sans. Grown-up but approachable.",
    display: "Fraunces", sans: "Outfit", weight: 600,
    href: "family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Outfit:wght@300..700"
  },
  {
    id: "minimal",
    name: "Fashion minimal",
    note: "A slim, condensed serif with a neutral sans. Quiet, stylish and very clean.",
    display: "Instrument Serif", sans: "DM Sans", weight: 400,
    href: "family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300..700"
  },
  {
    id: "bold-art",
    name: "Bold and artsy",
    note: "An expressive, wide sans for headlines. Confident, creative and modern, no serif at all.",
    display: "Syne", sans: "Manrope", weight: 700,
    href: "family=Syne:wght@400..800&family=Manrope:wght@300..800"
  }
];
