const ALL_SKILLS = {
  "Full-Stack Development": { how_to_learn: "Learn React + Node.js via freeCodeCamp and The Odin Project.", time_to_learn_weeks: 8 },
  "UI/UX Design": { how_to_learn: "Learn Figma through YouTube. Practice redesigning apps.", time_to_learn_weeks: 4 },
  "Product Management": { how_to_learn: "Take Google PM Certificate on Coursera. Practice writing PRDs.", time_to_learn_weeks: 4 },
  "Digital Marketing": { how_to_learn: "Google Digital Garage. Learn SEO, SEM, and content marketing.", time_to_learn_weeks: 3 },
  "Financial Modeling": { how_to_learn: "Learn from CFI free courses. Build P&L, cashflow models.", time_to_learn_weeks: 3 },
  "Data Analytics": { how_to_learn: "Learn SQL + Python. Take Google Data Analytics Certificate.", time_to_learn_weeks: 4 },
  "Sales & BD": { how_to_learn: "Read 'The Lean Startup'. Practice cold outreach.", time_to_learn_weeks: 2 },
  "Cloud (AWS/GCP/Azure)": { how_to_learn: "AWS Cloud Practitioner certification. Deploy projects.", time_to_learn_weeks: 3 },
  "Machine Learning": { how_to_learn: "Andrew Ng's ML course. Build ML projects.", time_to_learn_weeks: 8 },
  "Mobile (React Native)": { how_to_learn: "Expo documentation + React Native tutorial.", time_to_learn_weeks: 4 },
  "Legal & Compliance": { how_to_learn: "Learn DPIIT Startup India registration. Understand GST.", time_to_learn_weeks: 2 },
  "Content Writing": { how_to_learn: "Write 20 blog posts on Medium. Study copywriting frameworks.", time_to_learn_weeks: 2 },
  "Growth Hacking": { how_to_learn: "Read 'Hacking Growth'. Learn A/B testing, viral loops.", time_to_learn_weeks: 3 },
  "DevOps / CI-CD": { how_to_learn: "Learn GitHub Actions, Docker, and Kubernetes.", time_to_learn_weeks: 3 },
  "SEO / SEM": { how_to_learn: "Google Ads certification. Learn keyword research.", time_to_learn_weeks: 2 },
  "Cybersecurity": { how_to_learn: "Learn OWASP Top 10. Understand basic penetration testing.", time_to_learn_weeks: 5 },
  "Healthcare Regulations": { how_to_learn: "Study HIPAA and Indian healthcare laws.", time_to_learn_weeks: 3 },
  "Video Editing": { how_to_learn: "Learn Premiere Pro or DaVinci Resolve via YouTube tutorials.", time_to_learn_weeks: 3 },
  "Supply Chain Management": { how_to_learn: "Study logistics basics and inventory management.", time_to_learn_weeks: 4 }
};

function detectDomain(idea) {
  const lower = (idea || "").toLowerCase();
  if (lower.match(/food|restaurant|delivery|kitchen|recipe|meal/)) return 'food_delivery';
  if (lower.match(/education|learn|course|tutor|school|student|teach|edtech/)) return 'edtech';
  if (lower.match(/finance|bank|pay|wallet|invest|loan|credit|fintech|money/)) return 'fintech';
  if (lower.match(/health|medical|doctor|hospital|fitness|wellness|pharma|medtech/)) return 'healthtech';
  if (lower.match(/shop|ecommerce|store|retail|sell|product|marketplace/)) return 'ecommerce';
  if (lower.match(/social|community|network|chat|messaging|connect/)) return 'social';
  if (lower.match(/ai|machine learning|ml|nlp|deep learning|artificial intelligence|chatbot|automation/)) return 'ai_ml';
  if (lower.match(/saas|software|tool|platform|dashboard|analytics|crm/)) return 'saas';
  if (lower.match(/travel|booking|hotel|flight|tourism|trip/)) return 'travel';
  if (lower.match(/real estate|property|housing|rent|construction/)) return 'realestate';
  if (lower.match(/agri|farm|crop|agriculture/)) return 'agritech';
  return 'general';
}

const domainConfigs = {
  food_delivery: {
    complexity: 'medium',
    requiredSkills: ['Mobile (React Native)', 'Sales & BD', 'Digital Marketing', 'Supply Chain Management'],
    stages: [
      {
        stage_number: 1, stage_name: "Menu & Vendor Partnerships", stage_title: "Onboard Initial Restaurants", duration_weeks: 4,
        tasks: [
          { task: "Identify Target Cuisine", how_to_do_it: "Research local gaps in food delivery." },
          { task: "Onboard 5-10 Restaurants", how_to_do_it: "Pitch your platform to local eateries." },
          { task: "Finalize Menu & Pricing", how_to_do_it: "Work with vendors to set competitive prices." },
          { task: "Legal Contracts", how_to_do_it: "Draft agreements for commission and payouts." }
        ],
        checkpoint: "At least 5 restaurants signed up with finalized menus."
      },
      {
        stage_number: 2, stage_name: "Delivery App MVP", stage_title: "Build the Ordering Platform", duration_weeks: 6,
        tasks: [
          { task: "Customer App", how_to_do_it: "Build a React Native app for browsing and ordering." },
          { task: "Restaurant Dashboard", how_to_do_it: "Create a simple web view for restaurants to accept orders." },
          { task: "Payment Integration", how_to_do_it: "Integrate Razorpay or Stripe for seamless checkout." },
          { task: "Driver App Basics", how_to_do_it: "Build a basic interface for delivery partners." }
        ],
        checkpoint: "Working apps for customer, restaurant, and driver."
      },
      {
        stage_number: 3, stage_name: "Logistics & Operations", stage_title: "Set up Delivery Fleet", duration_weeks: 4,
        tasks: [
          { task: "Hire First 5 Drivers", how_to_do_it: "Recruit local gig workers or freelancers." },
          { task: "Define Delivery Zones", how_to_do_it: "Map out efficient delivery radiuses (e.g., 5km)." },
          { task: "Establish Support Channels", how_to_do_it: "Set up WhatsApp support for live orders." },
          { task: "Test Runs", how_to_do_it: "Do mock orders to test the end-to-end flow." }
        ],
        checkpoint: "Fleet ready and operations flow tested successfully."
      },
      {
        stage_number: 4, stage_name: "Marketing & Growth", stage_title: "Acquire First 100 Customers", duration_weeks: 4,
        tasks: [
          { task: "Hyper-local Ads", how_to_do_it: "Run Instagram and Facebook ads targeted to the delivery radius." },
          { task: "Promo Campaigns", how_to_do_it: "Offer 'First Order Free' or discounts." },
          { task: "Flyers & Offline", how_to_do_it: "Distribute flyers in high-density residential areas." },
          { task: "Monitor CAC", how_to_do_it: "Track customer acquisition cost closely." }
        ],
        checkpoint: "100+ active customers with growing daily orders."
      },
      {
        stage_number: 5, stage_name: "Scale & Funding", stage_title: "Expand Operations", duration_weeks: 6,
        tasks: [
          { task: "Optimize Unit Economics", how_to_do_it: "Analyze delivery costs vs revenue per order." },
          { task: "Expand Delivery Radius", how_to_do_it: "Gradually add new zones and restaurants." },
          { task: "Pitch Deck Preparation", how_to_do_it: "Compile metrics into a compelling investor deck." },
          { task: "Seed Funding Outreach", how_to_do_it: "Contact local angel investors for expansion capital." }
        ],
        checkpoint: "Positive unit economics in initial zones, ready for scaling."
      }
    ]
  },
  edtech: {
    complexity: 'medium',
    requiredSkills: ['Full-Stack Development', 'Content Writing', 'Video Editing', 'Digital Marketing'],
    stages: [
      {
        stage_number: 1, stage_name: "Curriculum Design & Research", stage_title: "Define the Learning Outcome", duration_weeks: 4,
        tasks: [
          { task: "Identify Skill Gap", how_to_do_it: "Interview students/professionals to find missing skills." },
          { task: "Draft Course Syllabus", how_to_do_it: "Outline modules, lessons, and expected outcomes." },
          { task: "Competitor Analysis", how_to_do_it: "Review existing courses on Udemy/Coursera." },
          { task: "Validate Pricing", how_to_do_it: "Survey target audience on willingness to pay." }
        ],
        checkpoint: "Validated syllabus and pricing model."
      },
      {
        stage_number: 2, stage_name: "Learning Platform MVP", stage_title: "Build the Content Portal", duration_weeks: 6,
        tasks: [
          { task: "Record Initial Content", how_to_do_it: "Shoot and edit the first 3 modules of the course." },
          { task: "Build Web Platform", how_to_do_it: "Develop a basic LMS using React and Node.js." },
          { task: "Implement Authentication", how_to_do_it: "Set up secure login for students." },
          { task: "Payment Gateway", how_to_do_it: "Integrate Razorpay to sell course access." }
        ],
        checkpoint: "Platform live with first 3 modules available for purchase."
      },
      {
        stage_number: 3, stage_name: "Beta with Students", stage_title: "Gather Initial Feedback", duration_weeks: 4,
        tasks: [
          { task: "Onboard 50 Beta Students", how_to_do_it: "Offer discounted access to early adopters." },
          { task: "Monitor Engagement", how_to_do_it: "Track video completion rates and drop-offs." },
          { task: "Gather Feedback", how_to_do_it: "Conduct surveys on content quality and pacing." },
          { task: "Iterate Content", how_to_do_it: "Reshoot confusing parts or add supplementary materials." }
        ],
        checkpoint: "High completion rate and positive feedback from beta cohort."
      },
      {
        stage_number: 4, stage_name: "Marketing & Sales", stage_title: "Drive Enrollments", duration_weeks: 5,
        tasks: [
          { task: "Content Marketing", how_to_do_it: "Publish free tutorials on YouTube to attract leads." },
          { task: "Email Campaigns", how_to_do_it: "Nurture leads with educational newsletters." },
          { task: "Webinars", how_to_do_it: "Host free live masterclasses to upsell the course." },
          { task: "Affiliate Program", how_to_do_it: "Offer commissions to students who refer others." }
        ],
        checkpoint: "Consistent weekly enrollments and growing lead list."
      },
      {
        stage_number: 5, stage_name: "Scale & Expansion", stage_title: "Grow the Catalog", duration_weeks: 6,
        tasks: [
          { task: "Launch Full Course", how_to_do_it: "Release all remaining modules." },
          { task: "Hire Instructors", how_to_do_it: "Partner with experts to create new courses." },
          { task: "B2B Sales", how_to_do_it: "Pitch bulk course access to colleges and companies." },
          { task: "Raise Capital", how_to_do_it: "Prepare metrics to pitch to EdTech investors." }
        ],
        checkpoint: "Multiple courses live with B2B and B2C revenue streams."
      }
    ]
  },
  fintech: {
    complexity: 'high',
    requiredSkills: ['Full-Stack Development', 'Financial Modeling', 'Legal & Compliance', 'Cybersecurity'],
    stages: [
      {
        stage_number: 1, stage_name: "Regulatory Research & Licensing", stage_title: "Navigate Compliance", duration_weeks: 8,
        tasks: [
          { task: "Understand Regulations", how_to_do_it: "Consult lawyers to understand RBI/SEBI guidelines." },
          { task: "Apply for Licenses", how_to_do_it: "Begin the process for necessary financial licenses." },
          { task: "Partner with Banks", how_to_do_it: "Establish partnerships with sponsor banks if needed." },
          { task: "Define Financial Model", how_to_do_it: "Model revenue streams, margins, and capital requirements." }
        ],
        checkpoint: "Clear regulatory pathway and initial bank partnerships established."
      },
      {
        stage_number: 2, stage_name: "Secure Infrastructure MVP", stage_title: "Build the Core Platform", duration_weeks: 10,
        tasks: [
          { task: "Develop Core Systems", how_to_do_it: "Build secure transaction processing engines." },
          { task: "Implement Security Standards", how_to_do_it: "Ensure PCI-DSS compliance and encryption." },
          { task: "Integrate APIs", how_to_do_it: "Connect with banking APIs, KYC providers, and payment gateways." },
          { task: "Internal Dashboard", how_to_do_it: "Build tools for monitoring transactions and fraud." }
        ],
        checkpoint: "Secure backend capable of processing test transactions."
      },
      {
        stage_number: 3, stage_name: "Closed Beta & Audits", stage_title: "Test Rigorously", duration_weeks: 6,
        tasks: [
          { task: "Security Audits", how_to_do_it: "Hire external firms for penetration testing." },
          { task: "Onboard Friendly Users", how_to_do_it: "Test the platform with friends and family." },
          { task: "Refine UX", how_to_do_it: "Ensure trust and clarity in the user interface." },
          { task: "Monitor Compliance", how_to_do_it: "Ensure all transactions meet regulatory reporting needs." }
        ],
        checkpoint: "Successful security audit and flawless test transactions."
      },
      {
        stage_number: 4, stage_name: "Go-to-Market", stage_title: "Public Launch", duration_weeks: 6,
        tasks: [
          { task: "Launch Marketing", how_to_do_it: "Focus campaigns on trust, security, and unique value." },
          { task: "Customer Support Setup", how_to_do_it: "Establish robust support for financial queries." },
          { task: "Monitor Fraud", how_to_do_it: "Implement AI/rules to detect suspicious activity." },
          { task: "Optimize Onboarding", how_to_do_it: "Streamline the KYC process to reduce drop-offs." }
        ],
        checkpoint: "Steady user growth with high retention and low fraud rates."
      },
      {
        stage_number: 5, stage_name: "Scaling & Series A", stage_title: "Expand Operations", duration_weeks: 8,
        tasks: [
          { task: "Expand Product Line", how_to_do_it: "Introduce new financial products (e.g., credit, insurance)." },
          { task: "Scale Infrastructure", how_to_do_it: "Ensure systems can handle high transaction volumes." },
          { task: "B2B Partnerships", how_to_do_it: "Integrate with other platforms for distribution." },
          { task: "Raise Series A", how_to_do_it: "Pitch strong unit economics and growth to VCs." }
        ],
        checkpoint: "Significant market presence and readiness for major scaling."
      }
    ]
  },
  healthtech: {
    complexity: 'high',
    requiredSkills: ['Full-Stack Development', 'Healthcare Regulations', 'Data Analytics', 'Sales & BD'],
    stages: [
      {
        stage_number: 1, stage_name: "Problem Validation & Compliance", stage_title: "Understand the Medical Need", duration_weeks: 6,
        tasks: [
          { task: "Interview Doctors/Patients", how_to_do_it: "Validate the specific pain point in healthcare delivery." },
          { task: "Study Regulations", how_to_do_it: "Understand HIPAA or local health data laws." },
          { task: "Define Data Strategy", how_to_do_it: "Plan secure storage for sensitive medical records." },
          { task: "Establish Medical Advisory", how_to_do_it: "Bring doctors on board as advisors." }
        ],
        checkpoint: "Validated need with a clear path to regulatory compliance."
      },
      {
        stage_number: 2, stage_name: "Secure Platform MVP", stage_title: "Build the Core Solution", duration_weeks: 8,
        tasks: [
          { task: "Develop Patient/Doctor Portals", how_to_do_it: "Build secure interfaces for users." },
          { task: "Implement EMR Integration", how_to_do_it: "Connect with existing electronic medical records if needed." },
          { task: "Ensure Data Encryption", how_to_do_it: "Implement end-to-end encryption for health data." },
          { task: "Telehealth Features", how_to_do_it: "Integrate secure video conferencing (if applicable)." }
        ],
        checkpoint: "Compliant MVP ready for clinical testing."
      },
      {
        stage_number: 3, stage_name: "Clinical Pilots", stage_title: "Test in Real Settings", duration_weeks: 8,
        tasks: [
          { task: "Partner with Clinics", how_to_do_it: "Deploy the solution in 1-2 pilot clinics." },
          { task: "Train Healthcare Staff", how_to_do_it: "Provide onboarding for doctors and nurses." },
          { task: "Gather Clinical Feedback", how_to_do_it: "Assess impact on patient outcomes and workflow." },
          { task: "Iterate Based on Usage", how_to_do_it: "Refine UI/UX based on doctor feedback." }
        ],
        checkpoint: "Successful pilot with positive feedback from medical professionals."
      },
      {
        stage_number: 4, stage_name: "Commercialization", stage_title: "Acquire Customers", duration_weeks: 6,
        tasks: [
          { task: "B2B Sales Outreach", how_to_do_it: "Pitch to hospitals and larger clinic networks." },
          { task: "Case Studies", how_to_do_it: "Publish results from the clinical pilots." },
          { task: "Attend Medical Conferences", how_to_do_it: "Network with healthcare decision-makers." },
          { task: "Refine Pricing", how_to_do_it: "Establish subscription or usage-based pricing." }
        ],
        checkpoint: "First paying B2B customers or steady B2C adoption."
      },
      {
        stage_number: 5, stage_name: "Scale & Certification", stage_title: "Expand Reach", duration_weeks: 8,
        tasks: [
          { task: "Seek Certifications", how_to_do_it: "Apply for relevant medical software certifications." },
          { task: "Integrate with Insurance", how_to_do_it: "Build features for claims and billing." },
          { task: "Expand Sales Team", how_to_do_it: "Hire specialized healthcare sales reps." },
          { task: "Fundraising", how_to_do_it: "Pitch healthtech VCs with proven clinical and commercial traction." }
        ],
        checkpoint: "Certified product scaling across multiple healthcare networks."
      }
    ]
  },
  ecommerce: {
    complexity: 'medium',
    requiredSkills: ['UI/UX Design', 'Digital Marketing', 'Supply Chain Management', 'SEO / SEM'],
    stages: [
      {
        stage_number: 1, stage_name: "Product Sourcing & Catalog", stage_title: "Define Inventory", duration_weeks: 4,
        tasks: [
          { task: "Identify Niche", how_to_do_it: "Research trending products or underserved markets." },
          { task: "Source Suppliers", how_to_do_it: "Find reliable manufacturers or dropshipping partners." },
          { task: "Order Samples", how_to_do_it: "Verify product quality before listing." },
          { task: "Product Photography", how_to_do_it: "Take high-quality photos and write compelling descriptions." }
        ],
        checkpoint: "Supplier agreements in place and product catalog ready."
      },
      {
        stage_number: 2, stage_name: "Storefront MVP", stage_title: "Build the Shop", duration_weeks: 4,
        tasks: [
          { task: "Setup E-commerce Platform", how_to_do_it: "Use Shopify, WooCommerce, or custom build." },
          { task: "Design Storefront", how_to_do_it: "Create an attractive, mobile-optimized theme." },
          { task: "Configure Payments", how_to_do_it: "Integrate gateways (Razorpay, Stripe, PayPal)." },
          { task: "Setup Shipping", how_to_do_it: "Configure delivery zones and partner with logistics companies." }
        ],
        checkpoint: "Fully functional online store ready to accept orders."
      },
      {
        stage_number: 3, stage_name: "Soft Launch", stage_title: "Test Operations", duration_weeks: 4,
        tasks: [
          { task: "Launch to Network", how_to_do_it: "Promote to friends, family, and existing followers." },
          { task: "Test Fulfillment", how_to_do_it: "Ensure smooth order processing and delivery." },
          { task: "Gather Reviews", how_to_do_it: "Encourage early buyers to leave product reviews." },
          { task: "Fix Bugs", how_to_do_it: "Resolve any checkout or navigation issues." }
        ],
        checkpoint: "First 50 orders processed successfully with positive reviews."
      },
      {
        stage_number: 4, stage_name: "Marketing & Acquisition", stage_title: "Drive Traffic", duration_weeks: 6,
        tasks: [
          { task: "Run Paid Social Ads", how_to_do_it: "Launch targeted Facebook, Instagram, or TikTok ads." },
          { task: "Influencer Marketing", how_to_do_it: "Partner with micro-influencers for product reviews." },
          { task: "Email Marketing Setup", how_to_do_it: "Create abandoned cart flows and newsletters." },
          { task: "SEO Optimization", how_to_do_it: "Optimize product pages for search engines." }
        ],
        checkpoint: "Consistent daily sales and positive ROAS (Return on Ad Spend)."
      },
      {
        stage_number: 5, stage_name: "Scale & Optimize", stage_title: "Maximize Profits", duration_weeks: 6,
        tasks: [
          { task: "Inventory Management", how_to_do_it: "Implement software to forecast demand and manage stock." },
          { task: "Expand Product Lines", how_to_do_it: "Introduce complementary products or new variations." },
          { task: "Improve Conversions", how_to_do_it: "A/B test product pages and checkout flows." },
          { task: "Explore Marketplaces", how_to_do_it: "List products on Amazon, Flipkart, etc." }
        ],
        checkpoint: "Profitable business model ready for significant scaling."
      }
    ]
  },
  ai_ml: {
    complexity: 'high',
    requiredSkills: ['Machine Learning', 'Full-Stack Development', 'Data Analytics', 'Cloud (AWS/GCP/Azure)'],
    stages: [
      {
        stage_number: 1, stage_name: "Data Collection & Model Research", stage_title: "Define the AI Solution", duration_weeks: 6,
        tasks: [
          { task: "Define Use Case", how_to_do_it: "Clearly articulate the problem the AI will solve." },
          { task: "Source Data", how_to_do_it: "Acquire proprietary datasets, scrape data, or use open-source." },
          { task: "Clean & Preprocess Data", how_to_do_it: "Prepare the data for model training." },
          { task: "Research Architectures", how_to_do_it: "Select appropriate ML models (e.g., Transformers, CNNs)." }
        ],
        checkpoint: "High-quality dataset ready and model architecture selected."
      },
      {
        stage_number: 2, stage_name: "ML Pipeline & API Development", stage_title: "Build the Core AI", duration_weeks: 8,
        tasks: [
          { task: "Train Initial Models", how_to_do_it: "Train baseline models and evaluate performance." },
          { task: "Optimize & Fine-tune", how_to_do_it: "Improve accuracy and reduce latency." },
          { task: "Build Inference API", how_to_do_it: "Wrap the model in a robust API (e.g., FastAPI)." },
          { task: "Setup Cloud Infrastructure", how_to_do_it: "Deploy the API on AWS/GCP with GPU support." }
        ],
        checkpoint: "Functioning AI model accessible via API with acceptable performance."
      },
      {
        stage_number: 3, stage_name: "Application Integration", stage_title: "Build the User Interface", duration_weeks: 6,
        tasks: [
          { task: "Develop Frontend", how_to_do_it: "Build a web or mobile app to interact with the AI." },
          { task: "Integrate AI API", how_to_do_it: "Connect the frontend to the inference backend." },
          { task: "Implement Feedback Loop", how_to_do_it: "Allow users to correct AI output to improve the model." },
          { task: "Ensure Scalability", how_to_do_it: "Optimize the architecture for concurrent requests." }
        ],
        checkpoint: "Complete MVP application demonstrating the AI capability."
      },
      {
        stage_number: 4, stage_name: "Beta Launch & Validation", stage_title: "Test with Users", duration_weeks: 4,
        tasks: [
          { task: "Onboard Beta Users", how_to_do_it: "Invite target users to test the application." },
          { task: "Monitor Model Performance", how_to_do_it: "Track real-world accuracy, latency, and errors." },
          { task: "Gather User Feedback", how_to_do_it: "Assess user satisfaction and workflow integration." },
          { task: "Refine based on Data", how_to_do_it: "Retrain models with the new data collected from beta." }
        ],
        checkpoint: "Validated AI solution providing tangible value to users."
      },
      {
        stage_number: 5, stage_name: "Commercialization & Scale", stage_title: "Go to Market", duration_weeks: 6,
        tasks: [
          { task: "Define Pricing Model", how_to_do_it: "Implement usage-based pricing or subscription tiers." },
          { task: "B2B Sales Outreach", how_to_do_it: "Pitch the AI solution to enterprises." },
          { task: "Develop API Product", how_to_do_it: "Offer the API directly to developers (if applicable)." },
          { task: "Raise Seed Funding", how_to_do_it: "Highlight technical moat and market potential to investors." }
        ],
        checkpoint: "Paying customers and a scalable AI product."
      }
    ]
  },
  saas: {
    complexity: 'medium',
    requiredSkills: ['Full-Stack Development', 'Product Management', 'Growth Hacking', 'UI/UX Design'],
    stages: [
      {
        stage_number: 1, stage_name: "Problem Validation & Scoping", stage_title: "Define the Workflow", duration_weeks: 4,
        tasks: [
          { task: "User Interviews", how_to_do_it: "Identify specific inefficiencies in target users' workflows." },
          { task: "Competitor Analysis", how_to_do_it: "Evaluate existing tools and find differentiation." },
          { task: "Define Core Features", how_to_do_it: "Outline the absolute minimum features needed to solve the problem." },
          { task: "Wireframe UI", how_to_do_it: "Design the user interface and user flows in Figma." }
        ],
        checkpoint: "Validated problem and clear specification for the MVP."
      },
      {
        stage_number: 2, stage_name: "SaaS MVP Development", stage_title: "Build the Core Tool", duration_weeks: 8,
        tasks: [
          { task: "Develop Multi-tenant Backend", how_to_do_it: "Build a scalable architecture for multiple organizations." },
          { task: "Implement Authentication & Roles", how_to_do_it: "Setup secure login and role-based access control." },
          { task: "Build Core Functionality", how_to_do_it: "Develop the main features defined in scoping." },
          { task: "Integrate Billing", how_to_do_it: "Setup Stripe or Chargebee for subscription management." }
        ],
        checkpoint: "Functional MVP capable of handling multiple user accounts and subscriptions."
      },
      {
        stage_number: 3, stage_name: "Beta & Onboarding", stage_title: "Test with Early Adopters", duration_weeks: 4,
        tasks: [
          { task: "Onboard Beta Testers", how_to_do_it: "Invite 10-20 companies to use the tool for free." },
          { task: "Provide High-touch Support", how_to_do_it: "Manually assist users to ensure success." },
          { task: "Gather Feature Requests", how_to_do_it: "Collect feedback and prioritize the roadmap." },
          { task: "Refine Onboarding", how_to_do_it: "Improve in-app tutorials and documentation." }
        ],
        checkpoint: "High engagement from beta users and a refined onboarding process."
      },
      {
        stage_number: 4, stage_name: "Launch & Go-to-Market", stage_title: "Acquire Customers", duration_weeks: 6,
        tasks: [
          { task: "Public Launch", how_to_do_it: "Launch on Product Hunt, Hacker News, and relevant communities." },
          { task: "Content Marketing", how_to_do_it: "Publish blog posts relevant to the target audience." },
          { task: "Cold Outreach", how_to_do_it: "Implement cold email campaigns to target prospects." },
          { task: "Monitor Key Metrics", how_to_do_it: "Track MRR, CAC, Churn, and LTV." }
        ],
        checkpoint: "First paying subscribers and established acquisition channels."
      },
      {
        stage_number: 5, stage_name: "Growth & Optimization", stage_title: "Scale MRR", duration_weeks: 6,
        tasks: [
          { task: "Optimize Funnel", how_to_do_it: "Improve website conversion rates and trial-to-paid conversions." },
          { task: "Expand Features", how_to_do_it: "Develop high-priority features based on user feedback." },
          { task: "Explore Partnerships", how_to_do_it: "Integrate with other tools in the ecosystem." },
          { task: "Raise Capital (Optional)", how_to_do_it: "Pitch VCs to accelerate growth." }
        ],
        checkpoint: "Steady MRR growth and a scalable go-to-market strategy."
      }
    ]
  },
  general: {
    complexity: 'medium',
    requiredSkills: ['Product Management', 'Digital Marketing', 'Sales & BD', 'Financial Modeling'],
    stages: [
      {
        stage_number: 1, stage_name: "Discovery & Validation", stage_title: "Market Research & Idea Validation", duration_weeks: 3,
        tasks: [
          { task: "Customer Discovery Interviews", how_to_do_it: "Conduct 20+ interviews with potential users to validate pain points." },
          { task: "Competitor Analysis", how_to_do_it: "Map the top 5-10 competitors and identify your unique differentiation." },
          { task: "Market Size Estimation", how_to_do_it: "Calculate TAM, SAM, and SOM using industry reports." },
          { task: "Problem Statement Refinement", how_to_do_it: "Synthesize insights into a clear problem statement." }
        ],
        checkpoint: "Validated problem and confirmed pain points."
      },
      {
        stage_number: 2, stage_name: "MVP Development", stage_title: "Build Minimum Viable Product", duration_weeks: 6,
        tasks: [
          { task: "Define Core Feature Set", how_to_do_it: "Ruthlessly cut to only 3-4 core features." },
          { task: "Design Wireframes", how_to_do_it: "Create low-fidelity wireframes and test usability." },
          { task: "Build the MVP", how_to_do_it: "Develop the initial version focusing on functionality." },
          { task: "Set Up Analytics", how_to_do_it: "Integrate tracking for user behavior and key metrics." }
        ],
        checkpoint: "Working MVP deployed and accessible to beta users."
      },
      {
        stage_number: 3, stage_name: "Beta Launch & Iteration", stage_title: "Launch to Early Adopters", duration_weeks: 4,
        tasks: [
          { task: "Onboard Beta Users", how_to_do_it: "Offer early access and collect structured feedback." },
          { task: "Measure Key Metrics", how_to_do_it: "Track retention, engagement, and user satisfaction." },
          { task: "Iterate Based on Feedback", how_to_do_it: "Prioritize bugs and feature requests." },
          { task: "Build Social Proof", how_to_do_it: "Collect testimonials and create case studies." }
        ],
        checkpoint: "Active beta users with measurable retention."
      },
      {
        stage_number: 4, stage_name: "Growth & Monetization", stage_title: "Scale Revenue & User Base", duration_weeks: 5,
        tasks: [
          { task: "Implement Pricing Strategy", how_to_do_it: "Test pricing models and optimize conversions." },
          { task: "Marketing Engine", how_to_do_it: "Execute content marketing and SEO strategies." },
          { task: "Paid Acquisition Testing", how_to_do_it: "Run targeted ads and optimize CAC." },
          { task: "Partnership Outreach", how_to_do_it: "Identify complementary products for co-marketing." }
        ],
        checkpoint: "First paying customers acquired and CAC established."
      },
      {
        stage_number: 5, stage_name: "Fundraising & Scale", stage_title: "Prepare for Investment", duration_weeks: 6,
        tasks: [
          { task: "Build Pitch Deck", how_to_do_it: "Create a comprehensive deck covering problem, solution, traction, and ask." },
          { task: "Financial Model", how_to_do_it: "Build multi-year projections including revenue, expenses, and runway." },
          { task: "Investor Outreach", how_to_do_it: "Target investors via warm intros and platforms." },
          { task: "Demo Day Prep", how_to_do_it: "Rehearse pitches and Q&A." }
        ],
        checkpoint: "Investor meetings scheduled and term sheet discussions initiated."
      }
    ]
  }
};

function getFundingEstimate(complexity) {
  switch(complexity) {
    case 'low': return '₹50,000 - ₹2,00,000';
    case 'high': return '₹10,00,000 - ₹50,00,000';
    case 'medium':
    default:
      return '₹2,00,000 - ₹10,00,000';
  }
}

export function generateMockRoadmap(idea, year, skills) {
  const ideaShort = idea ? idea.substring(0, 80) : "a startup";
  const userSkills = Array.isArray(skills) ? skills.map(s => s.toLowerCase()) : [];

  const domain = detectDomain(idea);
  const config = domainConfigs[domain] || domainConfigs['general'];

  // Check which required skills the user is MISSING
  const skillGaps = config.requiredSkills.map(skillName => {
    const req = ALL_SKILLS[skillName] || { how_to_learn: "Self-study and practice.", time_to_learn_weeks: 4 };
    
    const hasSkill = userSkills.some(us =>
      us.includes(skillName.toLowerCase()) ||
      skillName.toLowerCase().includes(us) ||
      (skillName === "Full-Stack Development" && (us.includes('full-stack') || us.includes('frontend') || us.includes('backend'))) ||
      (skillName === "UI/UX Design" && us.includes('ui/ux')) ||
      (skillName === "Data Analytics" && (us.includes('data analytics') || us.includes('data science'))) ||
      (skillName === "Digital Marketing" && (us.includes('digital marketing') || us.includes('seo') || us.includes('social media'))) ||
      (skillName === "Cloud (AWS/GCP/Azure)" && (us.includes('cloud') || us.includes('devops'))) ||
      (skillName === "Machine Learning" && (us.includes('machine learning') || us.includes('artificial intelligence') || us.includes('deep learning') || us.includes('data science'))) ||
      (skillName === "Mobile (React Native)" && (us.includes('mobile') || us.includes('flutter') || us.includes('react native'))) ||
      (skillName === "DevOps / CI-CD" && (us.includes('devops') || us.includes('ci-cd') || us.includes('cloud'))) ||
      (skillName === "SEO / SEM" && (us.includes('seo') || us.includes('digital marketing'))) ||
      (skillName === "Growth Hacking" && (us.includes('growth') || us.includes('digital marketing')))
    );

    return {
      skill_needed: skillName,
      student_has_it: hasSkill,
      how_to_learn: req.how_to_learn,
      time_to_learn_weeks: req.time_to_learn_weeks
    };
  });

  const totalWeeks = config.stages.reduce((sum, stage) => sum + stage.duration_weeks, 0);

  // Idea specific tasks and reasoning
  const stages = JSON.parse(JSON.stringify(config.stages));
  
  if (domain === 'general') {
     // inject idea into some tasks
     stages[0].tasks[0].task = "Customer Discovery for " + ideaShort;
  }

  return {
    idea_summary: `A ${domain.replace('_', ' ')} startup focused on ${ideaShort}`,
    idea_viability_score: 7,
    viability_reasoning: `This idea operates in the ${domain.replace('_', ' ')} domain. The concept of "${ideaShort}" requires domain-specific execution. With strong execution in ${config.requiredSkills.slice(0,2).join(' and ')} and proper market validation, this has the potential to capture meaningful market share. Key risks include competition and customer acquisition cost, but the fundamentals are solid for this domain.`,
    total_estimated_weeks: totalWeeks,
    stages: stages,
    skill_gap_analysis: skillGaps,
    funding_path: {
      bootstrap_cost_estimate: getFundingEstimate(config.complexity),
      stage_for_funding: "Post-MVP with initial users and measurable traction",
      indian_grants_and_programs: [
        { name: "Startup India Seed Fund", amount: "₹20 Lakh - ₹50 Lakh", eligibility: "DPIIT registered, less than 2 years old", url: "https://seedfund.startupindia.gov.in/" },
        { name: "TIDE 2.0 (DST)", amount: "₹7 Lakh per idea", eligibility: "Technology innovation with social impact", url: "https://dst.gov.in/scientific-programmes/s-t-and-innovation/technology-incubation-and-development-entrepreneurs" },
        { name: "Nidhi Prayas (DST)", amount: "₹10 Lakh per innovator", eligibility: "Prototype stage, incubator support required", url: "https://dst.gov.in/nidhi-prayas" },
        { name: "Atal Innovation Mission (AIM)", amount: "₹10 Crore per AIC", eligibility: "Early-stage startups through Atal Incubation Centres", url: "https://aim.gov.in/" },
        { name: "MEITY Startup Hub", amount: "₹25 Lakh - ₹1 Crore", eligibility: "Tech startups in AI, IoT, Blockchain", url: "https://meity.gov.in/" }
      ]
    }
  };
}

export function generateMockDomains(idea) {
  return {
    overall_confidence: 0.85,
    reasoning_summary: "Based on the startup idea, these domains represent the key areas of expertise needed to build, launch, and scale the product successfully in the Indian market.",
    domains: [
      { name: "Frontend Development", priority: "primary", category: "technical", reason: "Building an intuitive and responsive user interface is critical for user adoption.", confidence: 0.95 },
      { name: "Backend Engineering", priority: "primary", category: "technical", reason: "Scalable server architecture needed to handle growth.", confidence: 0.90 },
      { name: "Product Design (UI/UX)", priority: "primary", category: "design", reason: "User experience directly impacts retention and conversion rates.", confidence: 0.92 },
      { name: "Digital Marketing", priority: "secondary", category: "business", reason: "Customer acquisition through SEO, content, and paid channels.", confidence: 0.85 },
      { name: "Legal & Compliance", priority: "cross-domain", category: "legal", reason: "Indian startup regulations, DPIIT registration, and data privacy compliance.", confidence: 0.80 },
      { name: "Data Analytics", priority: "secondary", category: "technical", reason: "Tracking metrics for product-market fit and growth optimization.", confidence: 0.78 }
    ]
  };
}
