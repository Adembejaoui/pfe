// No need for OpenAI imports if you're going fully rule-based
// import OpenAI from "openai"
// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"

// System prompt is kept for reference but not used in the rule-based system
const SYSTEM_PROMPT = `
You are a helpful assistant for a boosting service platform. Your role is to assist clients when human boosters are offline or unavailable.

Guidelines:
- Be helpful, friendly, and professional
- Provide accurate information about the boosting process
- If you don't know specific details about an order, politely explain that you're an AI assistant and will relay the message to the booster
- Never make up information about specific order details you don't have
- Keep responses concise and to the point
- If a question is outside your scope, suggest contacting support
- Sign your messages with "- AI Assistant" so clients know they're talking to an automated system

Context: You're helping with game boosting services where clients pay boosters to improve their game rankings or complete specific achievements.
`

// Comprehensive rule-based responses for a boosting service
const RESPONSES = {
  // General responses
  greeting: [
    "Hello! I'm the AI Assistant for our boosting service. How can I help you today?\n\n- AI Assistant",
    "Hi there! Welcome to our boosting service. I'm here to assist you with any questions you might have.\n\n- AI Assistant",
    "Greetings! I'm your AI Assistant. How may I help you with our boosting services today?\n\n- AI Assistant",
  ],

  farewell: [
    "Thank you for contacting us. If you have any more questions, feel free to ask anytime!\n\n- AI Assistant",
    "I appreciate your time. Don't hesitate to reach out if you need further assistance with your order.\n\n- AI Assistant",
    "Thanks for chatting with me. Your booster will be notified of our conversation. Have a great day!\n\n- AI Assistant",
  ],

  default: [
    "Thank you for your message. I've recorded it and will make sure your booster sees it when they're back online. If you need immediate assistance, please contact our support team.\n\n- AI Assistant",
    "I've noted your message and will ensure it reaches your booster. For urgent matters, please reach out to our support team.\n\n- AI Assistant",
    "Your message has been saved. Your booster will respond as soon as they're available. For immediate help, please contact support.\n\n- AI Assistant",
  ],

  // Order-related responses
  order_status: [
    "I don't have access to specific order details. Your message will be relayed to your booster who will respond as soon as possible. If you need immediate assistance, please contact our support team.\n\n- AI Assistant",
    "Your booster will provide you with an update on your order status when they're available. For immediate updates, please contact our support team.\n\n- AI Assistant",
    "Order status updates are provided by your assigned booster. They'll respond to your inquiry as soon as possible. For urgent status checks, please contact support.\n\n- AI Assistant",
  ],

  order_completion: [
    "Completion times vary based on the service type and rank requirements. Your booster will provide you with the most accurate estimate for your specific order. Rest assured that our team works efficiently to complete orders as quickly as possible.\n\n- AI Assistant",
    "Your booster is working to complete your order as efficiently as possible. For a specific completion timeline, please wait for your booster to respond or contact our support team.\n\n- AI Assistant",
    "Order completion depends on several factors including service type, current rank, and desired rank. Your booster will provide you with regular updates on the progress.\n\n- AI Assistant",
  ],

  order_modification: [
    "To modify your order, please provide the details of the changes you'd like to make. I'll forward this to your booster, who will adjust your order accordingly. For immediate assistance with order modifications, please contact our support team.\n\n- AI Assistant",
    "Order modifications can be made through your booster or our support team. Please specify what changes you'd like, and I'll ensure your booster receives this information.\n\n- AI Assistant",
    "I've noted your request for order modification. Your booster will review this and make the necessary adjustments. If you need these changes implemented urgently, please contact support.\n\n- AI Assistant",
  ],

  // Service-related responses
  service_info: [
    "We offer various boosting services including rank boosting, placement matches, win boosting, and achievement unlocking. Each service is customized to your specific needs. For more detailed information about a specific service, please let me know which one you're interested in.\n\n- AI Assistant",
    "Our boosting services cover a wide range of games and requirements. Whether you need rank improvement, placement matches, or specific achievements, our professional boosters can help. For specific service details, please specify which service you're inquiring about.\n\n- AI Assistant",
    "We provide professional boosting services tailored to your gaming needs. This includes rank boosting, placement matches, and achievement unlocking. For more information on a particular service, please let me know which one interests you.\n\n- AI Assistant",
  ],

  pricing: [
    "Our pricing varies depending on the service and your current/desired ranks. For specific pricing information, please check our website or contact support for a custom quote. We offer competitive rates with discounts for returning customers.\n\n- AI Assistant",
    "Pricing is determined by several factors including the service type, current rank, desired rank, and any additional requirements. For an accurate quote, please visit our website or contact our support team.\n\n- AI Assistant",
    "We offer customized pricing based on your specific boosting needs. Factors that affect pricing include current rank, target rank, and service type. For detailed pricing information, please check our website or contact support.\n\n- AI Assistant",
  ],

  timeframe: [
    "Boosting timeframes vary based on the service type and your specific requirements. Your booster will provide you with an estimated completion time. If you need a rush service, please let us know and we'll do our best to accommodate your timeline.\n\n- AI Assistant",
    "The time required to complete your order depends on factors such as service type, rank difference, and game conditions. Your booster will give you a realistic timeframe for completion. Rush services are available for an additional fee.\n\n- AI Assistant",
    "Completion times vary by service and requirements. For rank boosting, the timeframe depends on the rank gap. For placement matches, it typically takes 1-2 days. Your booster will provide a specific estimate for your order.\n\n- AI Assistant",
  ],

  // Security and account-related responses
  security: [
    "We take security very seriously. All our boosters are vetted professionals, and we use secure methods to protect your account information. We never share your details with third parties, and our boosters follow strict security protocols.\n\n- AI Assistant",
    "Your account security is our top priority. We implement multiple security measures including secure connections, verified boosters, and strict data protection policies. If you have specific security concerns, please let us know.\n\n- AI Assistant",
    "We understand the importance of account security. Our boosters are trusted professionals who follow strict security guidelines. We also offer options like VPN usage and offline mode to enhance your account protection during the boosting process.\n\n- AI Assistant",
  ],

  account_recovery: [
    "If you're having trouble accessing your account, please contact our support team directly. For security reasons, account recovery assistance requires verification that I cannot provide as an AI assistant.\n\n- AI Assistant",
    "Account recovery needs to be handled by our human support team. Please contact them directly with your account details, and they'll guide you through the recovery process.\n\n- AI Assistant",
    "For account access issues, please reach out to our support team immediately. They have the tools and verification processes needed to help you recover your account securely.\n\n- AI Assistant",
  ],

  // Payment-related responses
  payment_methods: [
    "We accept various payment methods including credit/debit cards, PayPal, cryptocurrency, and bank transfers. All payments are processed securely. For specific payment questions, please contact our support team.\n\n- AI Assistant",
    "Our platform supports multiple payment options for your convenience. This includes major credit cards, PayPal, Bitcoin, and other methods. All transactions are encrypted and secure.\n\n- AI Assistant",
    "We offer flexible payment options including credit cards, PayPal, and cryptocurrency. If you need information about a specific payment method or have questions about payment processing, please let me know.\n\n- AI Assistant",
  ],

  refund_policy: [
    "We have a satisfaction guarantee policy. If you're not satisfied with our service, please contact support to discuss your concerns. Refund eligibility depends on the specific circumstances and service progress. Our support team will be happy to review your case.\n\n- AI Assistant",
    "Our refund policy aims to ensure customer satisfaction. If the service doesn't meet your expectations, please contact our support team with details about your concerns. They'll review your case and provide appropriate solutions.\n\n- AI Assistant",
    "We stand behind the quality of our boosting services. If you're experiencing issues with your order, please contact support immediately. Refunds are considered on a case-by-case basis depending on the order status and specific situation.\n\n- AI Assistant",
  ],

  // Game-specific responses
  game_specific: {
    lol: [
      "For League of Legends boosting, we offer services including solo/duo rank boosting, placement matches, win boosting, and coaching. Our boosters are high-elo players who can help you achieve your desired rank efficiently and safely.\n\n- AI Assistant",
      "Our League of Legends boosting services cover all ranks from Iron to Challenger. We have specialized boosters for different roles and champions. For specific LoL boosting questions, please provide more details about your needs.\n\n- AI Assistant",
    ],
    valorant: [
      "Our Valorant boosting services include rank boosting, placement matches, and win boosting. Our boosters are experienced players who maintain high win rates across all ranks. We can help you reach your desired rank quickly and safely.\n\n- AI Assistant",
      "For Valorant, we offer comprehensive boosting services from Iron to Radiant. Our boosters are skilled in all agents and maps, ensuring efficient progress regardless of your current rank or playstyle.\n\n- AI Assistant",
    ],
    overwatch: [
      "Our Overwatch boosting services cover all competitive ranks. We offer rank boosting, placement matches, and group boosting options. Our boosters are skilled in all roles and heroes, ensuring quality service regardless of your preferences.\n\n- AI Assistant",
      "For Overwatch boosting, we provide services for all ranks and roles. Whether you need DPS, Tank, or Support boosting, our team can help you reach your goals efficiently and safely.\n\n- AI Assistant",
    ],
    csgo: [
      "Our CS:GO boosting services include rank boosting, placement matches, and win boosting. Our boosters are experienced players with high win rates who can help you achieve your desired rank quickly and efficiently.\n\n- AI Assistant",
      "For CS:GO, we offer comprehensive boosting services across all ranks. Our boosters are skilled players who maintain high performance in competitive matches, ensuring quality results for your order.\n\n- AI Assistant",
    ],
    default_game: [
      "We offer boosting services for various games. If you're inquiring about a specific game, please let me know which one, and I'll provide you with detailed information about our services for that game.\n\n- AI Assistant",
      "Our boosting services cover multiple popular games. For specific information about boosting in your game of choice, please specify which game you're interested in, and I'll share the relevant details.\n\n- AI Assistant",
    ],
  },

  // Help and support responses
  help: [
    "I can provide general information about our boosting services, pricing, security measures, and policies. For specific questions about your order, your booster will respond when they're available. Is there anything specific you'd like to know?\n\n- AI Assistant",
    "I'm here to help with general inquiries about our services. This includes information about different boosting options, approximate timeframes, and general policies. What specific information are you looking for?\n\n- AI Assistant",
    "I can assist with general questions about our boosting services. For order-specific details or urgent matters, please contact our support team who can provide immediate assistance.\n\n- AI Assistant",
  ],

  contact_support: [
    "To contact our support team, please use the support chat on our website or email support@yourboosting.com. Our team is available 24/7 to assist with any questions or concerns you might have.\n\n- AI Assistant",
    "Our support team is available 24/7 through the support chat feature on our website. For email support, please contact support@yourboosting.com. They typically respond within 1-2 hours.\n\n- AI Assistant",
    "You can reach our support team via the chat feature on our website, by email at support@yourboosting.com, or through our Discord server. They're available around the clock to assist with any issues.\n\n- AI Assistant",
  ],

  // New response for when booster is active
  booster_active: [
    "Your booster is currently active and will respond to your message directly. I'll step aside to let them assist you personally.\n\n- AI Assistant",
    "I see that your booster is online. They'll be responding to your message directly for more personalized assistance.\n\n- AI Assistant",
    "Your assigned booster is currently active and will handle your request personally. They'll respond to you shortly.\n\n- AI Assistant",
  ],
}

// Function to generate AI response using rule-based system
export async function generateAIResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  orderContext?: {
    orderId: number
    service?: string
    currentRank?: any
    desiredRank?: any
    wins?: number
    placements?: number
    isBoosterActive?: boolean // New property to check if booster is active
  },
) {
  try {
    // Check if booster is active - if so, don't generate an AI response
    if (orderContext?.isBoosterActive === true) {
      // Return null or a specific message indicating the booster will respond
      return getRandomResponse(RESPONSES.booster_active);
    }

    // Get the latest user message
    const latestUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content || ""

    // Get a response based on the user's message
    return getRuleBasedResponse(latestUserMessage, orderContext)
  } catch (error) {
    console.error("Error generating AI response:", error)
    return RESPONSES.default[0]
  }
}

// Function to get a rule-based response based on the user's message and context
function getRuleBasedResponse(userMessage: string, orderContext?: any): string {
  const message = userMessage.toLowerCase()

  // Check for farewells first
  if (message.match(/bye|goodbye|see you|farewell|thanks|thank you/i)) {
    return getRandomResponse(RESPONSES.farewell)
  }

  // Check for greetings
  if (message.match(/hello|hi|hey|greetings|howdy|what's up|sup/i)) {
    return getRandomResponse(RESPONSES.greeting)
  }

  // Order status inquiries
  if (message.match(/status|progress|update|how.*going|when.*done|where.*order|check.*order/i)) {
    return getRandomResponse(RESPONSES.order_status)
  }

  // Order completion inquiries
  if (message.match(/finish|complete|done|ready|eta|estimate|timeline/i)) {
    return getRandomResponse(RESPONSES.order_completion)
  }

  // Order modification requests
  if (message.match(/change|modify|update|different|switch|alter|adjust/i)) {
    return getRandomResponse(RESPONSES.order_modification)
  }

  // Service information requests
  if (message.match(/service|offer|provide|what.*do|can you|available/i)) {
    return getRandomResponse(RESPONSES.service_info)
  }

  // Pricing inquiries
  if (message.match(/price|cost|how much|pricing|fee|charge|payment|pay/i)) {
    return getRandomResponse(RESPONSES.pricing)
  }

  // Timeframe inquiries
  if (message.match(/how long|timeframe|time frame|duration|when.*complete|fast|quick|rush/i)) {
    return getRandomResponse(RESPONSES.timeframe)
  }

  // Security concerns
  if (message.match(/secure|security|safe|protect|hack|steal|account|password|login/i)) {
    return getRandomResponse(RESPONSES.security)
  }

  // Account recovery
  if (message.match(/recover|forgot|can't access|cannot access|lost|reset|password/i)) {
    return getRandomResponse(RESPONSES.account_recovery)
  }

  // Payment methods
  if (message.match(/payment|pay|method|credit|card|paypal|bitcoin|crypto/i)) {
    return getRandomResponse(RESPONSES.payment_methods)
  }

  // Refund policy
  if (message.match(/refund|money back|cancel|not satisfied|unhappy|disappointed/i)) {
    return getRandomResponse(RESPONSES.refund_policy)
  }

  // Game-specific inquiries
  if (message.match(/league|lol|legends/i)) {
    return getRandomResponse(RESPONSES.game_specific.lol)
  }

  if (message.match(/valorant|val/i)) {
    return getRandomResponse(RESPONSES.game_specific.valorant)
  }

  if (message.match(/overwatch|ow/i)) {
    return getRandomResponse(RESPONSES.game_specific.overwatch)
  }

  if (message.match(/cs|csgo|counter|strike/i)) {
    return getRandomResponse(RESPONSES.game_specific.csgo)
  }

  if (message.match(/game|play/i)) {
    return getRandomResponse(RESPONSES.game_specific.default_game)
  }

  // Help requests
  if (message.match(/help|support|assist|guidance|question/i)) {
    return getRandomResponse(RESPONSES.help)
  }

  // Contact support
  if (message.match(/contact|reach|talk|speak|chat|human|person|support|team/i)) {
    return getRandomResponse(RESPONSES.contact_support)
  }

  // Default response if no patterns match
  return getRandomResponse(RESPONSES.default)
}

// Helper function to get a random response from an array of responses
function getRandomResponse(responses: string[]): string {
  const index = Math.floor(Math.random() * responses.length)
  return responses[index]
}
