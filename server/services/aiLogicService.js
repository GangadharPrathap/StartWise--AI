// This logic was extracted from App.jsx to centralize AI-related logic on the backend.

export function detectTopic(prompt) {
  const p = prompt.toLowerCase();
  const map = {
    food: ['food', 'tiffin', 'restaurant', 'delivery', 'kitchen', 'cook', 'meal', 'snack', 'cloud kitchen'],
    edtech: ['education', 'student', 'learn', 'teach', 'school', 'college', 'course', 'tutor', 'jee', 'neet'],
    health: ['health', 'doctor', 'medicine', 'hospital', 'fitness', 'medical', 'patient', 'clinic', 'pharma'],
    fintech: ['money', 'payment', 'loan', 'invest', 'finance', 'bank', 'insurance', 'credit', 'upi'],
    agri: ['farmer', 'farm', 'crop', 'agriculture', 'kisan', 'harvest', 'vegetable', 'grain'],
    saas: ['software', 'tool', 'platform', 'dashboard', 'automation', 'crm', 'erp', 'management', 'workflow'],
    ecommerce: ['shop', 'ecommerce', 'store', 'retail', 'sell', 'product', 'marketplace', 'buy'],
    social: ['social', 'community', 'connect', 'network', 'chat', 'messaging', 'content creator', 'influencer'],
    ai: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'generative'],
    mobility: ['transport', 'ride', 'cab', 'taxi', 'logistics', 'fleet', 'ev', 'electric vehicle', 'scooter'],
    realestate: ['real estate', 'property', 'housing', 'rent', 'construction', 'interior', 'building']
  };
  for (const [topic, words] of Object.entries(map)) {
    if (words.some(w => p.includes(w))) return topic;
  }
  return 'tech';
}

export function extractOrGenerateName(prompt, topic) {
  const words = prompt.split(' ');
  const caps = words.find(w => w.length > 3 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
  if (caps && caps.length > 3) return caps;

  const names = {
    food: ['TiffinHub', 'FreshBox', 'GharKhana', 'MealMate', 'YumGo'],
    edtech: ['LearnFast', 'VidyaAI', 'SmartGuru', 'StudyPro', 'GyanBox'],
    health: ['DocNear', 'CareAI', 'SwasthApp', 'MedEasy', 'HealHub'],
    fintech: ['PayFast', 'DhanAI', 'MoneyMate', 'FinEasy', 'ArthPro'],
    agri: ['KisanHub', 'FarmDirect', 'FasalAI', 'GreenMart', 'AgroConnect'],
    saas: ['FlowAI', 'DashPro', 'StackUp', 'AutoMate', 'ScaleHub'],
    ecommerce: ['CartGenius', 'ShopWave', 'BazaarAI', 'SellerPro', 'TradeHub'],
    social: ['ConnectAI', 'TribeTech', 'SocialNest', 'VibeNet', 'CommunityPro'],
    ai: ['NeuralEdge', 'AIForge', 'BrainWave', 'DeepLogic', 'IntelliCore'],
    mobility: ['GoFleet', 'RideSync', 'MoveEase', 'TransitAI', 'WheelHub'],
    realestate: ['PropTech', 'HomeFinder', 'RealtyAI', 'NestPro', 'SpaceHub'],
    tech: ['TechHub', 'AppPro', 'DigiSolve', 'SmartApp', 'InnovatePro']
  };
  const list = names[topic] || names.tech;
  return list[Math.floor(Math.random() * list.length)];
}

export function extractCity(prompt) {
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const p = prompt.toLowerCase();
  return cities.find(c => p.includes(c.toLowerCase())) || 'Delhi NCR';
}

export function extractFunding(prompt) {
  const match = prompt.match(/₹\s*\d+\s*(lakh|crore|L|Cr)/i);
  return match ? match[0] : null;
}

/**
 * Calculates a dynamic opportunity score based on idea characteristics.
 * Analyzes specificity, uniqueness signals, market size, and complexity
 * to produce a score that varies meaningfully across different ideas.
 */
function calculateOpportunityScore(idea, topic, city) {
  const p = idea.toLowerCase();
  const wordCount = idea.split(/\s+/).length;

  // Base score varies by topic (market saturation vs opportunity)
  const topicBaseScores = {
    food: 6.4,      // Very saturated (Zomato, Swiggy dominate)
    edtech: 7.1,    // Growing but competitive
    health: 7.8,    // High need, regulatory barriers
    fintech: 7.5,   // Massive market, heavy regulation
    agri: 8.2,      // Underserved, high impact
    saas: 7.0,      // Broad, depends on niche
    ecommerce: 5.9, // Extremely saturated
    social: 5.5,    // Very hard to differentiate
    ai: 7.6,        // Trending but needs specificity
    mobility: 6.8,  // Capital intensive
    realestate: 6.5,// Slow-moving market
    tech: 6.7       // Generic
  };
  let score = topicBaseScores[topic] || 6.7;

  // Reward specificity — longer, more detailed ideas score higher
  if (wordCount > 50) score += 0.8;
  else if (wordCount > 30) score += 0.5;
  else if (wordCount > 15) score += 0.2;
  else score -= 0.5; // Vague, short ideas penalized

  // Reward unique differentiators in the idea
  const differentiators = ['ai', 'machine learning', 'blockchain', 'ar', 'vr', 'iot', 'drone', 'automation', 'personali'];
  const diffCount = differentiators.filter(d => p.includes(d)).length;
  score += Math.min(diffCount * 0.3, 0.9);

  // Reward clear monetization signals
  const monetizationSignals = ['subscription', 'freemium', 'commission', 'revenue', 'pricing', 'premium', 'ads', 'marketplace fee', 'saas', 'b2b', 'b2c'];
  const monCount = monetizationSignals.filter(m => p.includes(m)).length;
  score += Math.min(monCount * 0.2, 0.6);

  // Reward problem-solution clarity
  const problemSignals = ['problem', 'solve', 'pain point', 'challenge', 'gap', 'need', 'struggle', 'lack of', 'no existing'];
  const probCount = problemSignals.filter(s => p.includes(s)).length;
  score += Math.min(probCount * 0.2, 0.4);

  // City-based adjustment (tier-1 = more competition, tier-2 = more opportunity)
  const tier1Cities = ['delhi', 'mumbai', 'bangalore', 'bengaluru'];
  const tier2Cities = ['hyderabad', 'pune', 'chennai'];
  const cityLower = (city || '').toLowerCase();
  if (tier1Cities.some(c => cityLower.includes(c))) score -= 0.2; // More competition
  else if (tier2Cities.some(c => cityLower.includes(c))) score += 0.1; // Less saturated

  // Penalize overly generic ideas
  const genericTerms = ['app', 'website', 'platform', 'application'];
  const hasOnlyGeneric = genericTerms.some(g => p.includes(g)) && wordCount < 15;
  if (hasOnlyGeneric) score -= 0.6;

  // Add small deterministic randomness based on idea content (so same idea = same score)
  const hash = idea.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const jitter = ((hash % 100) - 50) / 100; // -0.5 to +0.5
  score += jitter * 0.3;

  // Clamp between 3.0 and 9.5
  return Math.round(Math.max(3.0, Math.min(9.5, score)) * 10) / 10;
}

/**
 * Returns market stats that vary by topic
 */
function getMarketStats(topic) {
  const stats = {
    food: { tam: "$8.4B", growth: "28%", users: "1.2M", competitors: ["Zomato", "Swiggy", "EatFit"], risk: "High" },
    edtech: { tam: "$4.2B", growth: "39%", users: "2.5M", competitors: ["Byju's", "Unacademy", "PhysicsWallah"], risk: "Medium" },
    health: { tam: "$6.1B", growth: "32%", users: "800K", competitors: ["Practo", "PharmEasy", "HealthifyMe"], risk: "Medium" },
    fintech: { tam: "$31B", growth: "22%", users: "5M", competitors: ["Razorpay", "PhonePe", "BharatPe"], risk: "High" },
    agri: { tam: "$2.3B", growth: "41%", users: "300K", competitors: ["DeHaat", "Ninjacart", "AgroStar"], risk: "Low" },
    saas: { tam: "$3.8B", growth: "35%", users: "100K", competitors: ["Zoho", "Freshworks", "Postman"], risk: "Medium" },
    ecommerce: { tam: "$12B", growth: "19%", users: "8M", competitors: ["Amazon", "Flipkart", "Meesho"], risk: "Very High" },
    social: { tam: "$1.8B", growth: "24%", users: "15M", competitors: ["Instagram", "ShareChat", "Koo"], risk: "Very High" },
    ai: { tam: "$7.8B", growth: "45%", users: "200K", competitors: ["OpenAI tools", "Google AI", "Indian AI startups"], risk: "Medium" },
    mobility: { tam: "$5.2B", growth: "26%", users: "3M", competitors: ["Ola", "Uber", "Rapido"], risk: "High" },
    realestate: { tam: "$9.3B", growth: "15%", users: "500K", competitors: ["MagicBricks", "99acres", "NoBroker"], risk: "Medium" },
    tech: { tam: "$5.5B", growth: "31%", users: "1M", competitors: ["Various incumbents"], risk: "Medium" }
  };
  return stats[topic] || stats.tech;
}

/**
 * Generates dynamic target customer and revenue model based on idea + topic
 */
function getBusinessModel(idea, topic) {
  const p = idea.toLowerCase();
  
  const customers = {
    food: p.includes('corporate') ? "Corporate employees & office workers" : p.includes('student') ? "College students in hostels" : "Urban millennials & working professionals (22-35)",
    edtech: p.includes('skill') ? "Working professionals seeking upskilling" : p.includes('kid') || p.includes('child') ? "Parents of K-12 students" : "College students preparing for competitive exams",
    health: p.includes('mental') ? "Young adults (18-30) seeking mental wellness" : p.includes('rural') ? "Rural communities with limited healthcare access" : "Urban patients seeking convenience in healthcare",
    fintech: p.includes('rural') || p.includes('farmer') ? "Rural population underserved by banking" : p.includes('invest') ? "Retail investors & first-time traders" : "SMBs and gig workers needing financial tools",
    agri: "Small and medium farmers in tier-2/3 regions",
    saas: p.includes('small') || p.includes('sme') ? "Small business owners and freelancers" : "Mid-market companies (50-500 employees)",
    ecommerce: p.includes('local') ? "Local shopkeepers going digital" : "Price-conscious online shoppers in tier-2/3 cities",
    social: p.includes('creator') || p.includes('content') ? "Content creators & micro-influencers" : "Gen Z users seeking niche community spaces",
    ai: p.includes('enterprise') ? "Enterprise teams automating workflows" : "Developers & tech-savvy professionals",
    mobility: p.includes('ev') ? "Environmentally-conscious urban commuters" : "Daily commuters in metro cities",
    realestate: p.includes('rent') ? "Young professionals seeking rental housing" : "First-time home buyers (28-40)",
    tech: "Tech-savvy early adopters in metro cities"
  };

  const revenueModels = {
    food: "Commission per order (15-25%) + delivery charges + subscription plans",
    edtech: "Freemium model with paid courses + certification fees + B2B licensing",
    health: "Consultation fees + subscription plans + pharmacy commission",
    fintech: "Transaction fees (0.5-2%) + premium subscriptions + interest margin",
    agri: "Platform commission (5-10%) + input sales margin + advisory subscriptions",
    saas: "Monthly/Annual SaaS subscription (tiered pricing) + enterprise contracts",
    ecommerce: "Marketplace commission (10-20%) + advertising + logistics fees",
    social: "Advertising + premium subscriptions + creator monetization cut",
    ai: "API usage-based pricing + enterprise licenses + freemium tier",
    mobility: "Per-ride commission (20-30%) + surge pricing + corporate packages",
    realestate: "Brokerage fees + listing subscriptions + lead generation",
    tech: "Subscription model + transaction fees"
  };

  return {
    targetCustomer: customers[topic] || customers.tech,
    revenueModel: revenueModels[topic] || revenueModels.tech
  };
}


export function generateMockDashboard(idea, city) {
  const topic = detectTopic(idea);
  const startupName = extractOrGenerateName(idea, topic);
  const s = getMarketStats(topic);
  const score = calculateOpportunityScore(idea, topic, city);
  const { targetCustomer, revenueModel } = getBusinessModel(idea, topic);

  // Dynamic strength/weakness based on score
  const scoreLabel = score >= 8 ? "Excellent" : score >= 6.5 ? "Promising" : score >= 5 ? "Moderate" : "Needs Work";
  const riskLevel = score >= 8 ? "Low" : score >= 6.5 ? "Medium" : score >= 5 ? "High" : "Very High";

  return {
    startupName,
    marketSize: s.tam,
    marketAnalysisDetails: `The ${topic} market in ${city} presents a ${score >= 7 ? 'significant' : score >= 5.5 ? 'moderate' : 'challenging'} opportunity. With a projected TAM of ${s.tam} and growth rate of ${s.growth}, ${startupName} can target ${targetCustomer.toLowerCase()}. Key competitors include ${s.competitors.join(', ')}. The risk level is ${riskLevel.toLowerCase()} given the current market dynamics.`,
    fullMarketResearch: `**Comprehensive Market Research Report for ${startupName}**\n\n**1. Industry Overview (${topic})**\nThe ${topic} industry in ${city} represents an addressable market worth ${s.tam}. The sector has seen a compound annual growth rate (CAGR) of ${s.growth}.\n\n**2. Competitive Landscape**\nCurrently, the market is dominated by players like ${s.competitors.join(', ')}. ${score >= 7 ? 'However, there are clear gaps that a focused new entrant can exploit.' : 'The competitive intensity is high, requiring strong differentiation to succeed.'}\n\n**3. Target Audience & Adoption**\nThe core user base comprises ${s.users} active users. ${targetCustomer} represent the primary segment.\n\n**4. Strategic Risks & Mitigation**\n- *Risk Level:* ${riskLevel}\n- *Primary Risk:* ${s.risk === 'Very High' ? 'Dominant incumbents with massive user bases' : s.risk === 'High' ? 'High CAC and unit economics challenges' : 'Regulatory and adoption barriers'}\n- *Mitigation:* ${score >= 7 ? 'Leveraging technology moats and viral growth loops' : 'Focused niche targeting and capital-efficient growth'}\n\nOverall Opportunity Score: ${score}/10 — ${scoreLabel}.`,
    opportunityScore: score,
    competitors: s.competitors.map((name, i) => ({ 
      name, 
      strength: i === 0 ? "Market Leader" : i === 1 ? "Strong Brand" : "Growing Fast",
      weakness: i === 0 ? "Slow Innovation" : i === 1 ? "High Burn Rate" : "Limited Reach"
    })),
    pitchSlides: [
      { slideNumber: 1, title: "The Problem", content: `Current solutions in ${topic} are ${score >= 7 ? 'inadequate for the emerging needs of' : 'entrenched but leave gaps for'} users in ${city}. ${targetCustomer} face daily friction.` },
      { slideNumber: 2, title: "Our Solution", content: `${startupName} provides a ${score >= 7 ? 'breakthrough' : 'targeted'}, technology-driven experience that addresses these pain points directly.` },
      { slideNumber: 3, title: "Market Size", content: `TAM: ${s.tam} with ${s.growth} YoY growth. Revenue model: ${revenueModel}.` }
    ],
    investorEmail: {
      subject: `Investment Opportunity: ${startupName} - ${topic.charAt(0).toUpperCase() + topic.slice(1)} Innovation in ${city}`,
      body: `Hi,\n\nI'm building ${startupName}, targeting ${targetCustomer.toLowerCase()} in ${city}. The ${topic} sector has a TAM of ${s.tam} growing at ${s.growth} YoY.\n\nOur ${revenueModel.split('+')[0].trim()} model positions us for sustainable growth. I'd love to discuss this opportunity.\n\nBest,\nFounder`
    },
    targetCustomer,
    revenueModel,
    localInvestors: [],
    marketGrowth: s.growth,
    marketTrends: getMarketTrends(topic),
    riskLevel,
    thinkingAnalysis: `### 🧠 Strategic Deep-Dive: ${startupName}\n\n**Opportunity Score: ${score}/10 — ${scoreLabel}**\n\n#### 🎯 Market Entry & Moat\n- **Market Position**: ${score >= 7 ? 'Strong opportunity with clear gaps in the market' : score >= 5.5 ? 'Moderate opportunity requiring strong differentiation' : 'Challenging market requiring innovative approach'}\n- **Target Segment**: ${targetCustomer}\n- **Revenue Approach**: ${revenueModel}\n\n#### ⚖️ Risk-Opportunity Matrix\n- **Risk Level**: ${riskLevel}\n- **Primary Competitors**: ${s.competitors.join(', ')}\n- **Key Advantage**: ${score >= 7 ? 'First-mover in underserved niche' : 'Technology differentiation potential'}\n\n#### 🚀 Scaling Path\n1. **Phase 1**: Validate with 100 power users in ${city}\n2. **Phase 2**: Achieve ${score >= 7 ? 'product-market fit and viral growth' : 'unit economics and retention benchmarks'}\n3. **Phase 3**: ${score >= 7 ? 'Expand to 3+ cities and seek Series A' : 'Prove scalability before raising institutional capital'}`
  };
}

function getMarketTrends(topic) {
  const trends = {
    food: ["Cloud Kitchens", "Subscription Meals", "AI Demand Forecasting", "Sustainable Packaging"],
    edtech: ["AI Tutoring", "Micro-credentials", "Vernacular Content", "Skill-Based Learning"],
    health: ["Telemedicine", "AI Diagnostics", "Mental Health Tech", "Wearable Integration"],
    fintech: ["Embedded Finance", "UPI Innovation", "RegTech", "BNPL"],
    agri: ["Precision Farming", "Direct-to-Consumer", "AgriFintech", "Drone Monitoring"],
    saas: ["Product-Led Growth", "AI-Native Features", "Vertical SaaS", "Usage-Based Pricing"],
    ecommerce: ["Social Commerce", "Quick Commerce", "D2C Brands", "AR Try-On"],
    social: ["Creator Economy", "Short-Form Video", "Community Commerce", "AI Content Tools"],
    ai: ["Generative AI", "MLOps", "Edge AI", "Responsible AI"],
    mobility: ["EV Adoption", "Autonomous Driving", "MaaS Platforms", "Fleet Electrification"],
    realestate: ["PropTech AI", "Virtual Tours", "Co-Living", "Green Buildings"],
    tech: ["Digital Transformation", "AI Integration", "Cloud-Native", "Sustainability Tech"]
  };
  return trends[topic] || trends.tech;
}
