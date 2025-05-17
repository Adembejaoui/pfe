// Helper functions to handle AI-related errors

export type AIErrorType =
  | "api_key_error"
  | "rate_limit_error"
  | "quota_exceeded"
  | "invalid_request"
  | "server_error"
  | "unknown_error"

export interface AIError {
  type: AIErrorType
  message: string
  userMessage: string
  shouldRetry: boolean
}

export function handleAIError(error: any): AIError {
  // Check for OpenAI API key errors
  if (error.message?.includes("API key")) {
    return {
      type: "api_key_error",
      message: "Invalid or missing OpenAI API key",
      userMessage: "The AI service is currently unavailable. Please try again later or contact support.",
      shouldRetry: false,
    }
  }

  // Check for rate limit errors
  if (error.message?.includes("rate limit") || error.status === 429) {
    return {
      type: "rate_limit_error",
      message: "OpenAI rate limit exceeded",
      userMessage: "The AI service is experiencing high demand. Please try again in a few minutes.",
      shouldRetry: true,
    }
  }

  // Check for quota exceeded
  if (error.message?.includes("quota") || error.message?.includes("billing")) {
    return {
      type: "quota_exceeded",
      message: "OpenAI quota exceeded or billing issue",
      userMessage: "The AI service is temporarily unavailable. Our team has been notified.",
      shouldRetry: false,
    }
  }

  // Check for invalid requests
  if (error.status === 400) {
    return {
      type: "invalid_request",
      message: "Invalid request to OpenAI API",
      userMessage: "There was an issue with your request. Please try a different question.",
      shouldRetry: true,
    }
  }

  // Check for server errors
  if (error.status >= 500) {
    return {
      type: "server_error",
      message: "OpenAI server error",
      userMessage: "The AI service is experiencing technical difficulties. Please try again later.",
      shouldRetry: true,
    }
  }

  // Default unknown error
  return {
    type: "unknown_error",
    message: error.message || "Unknown error occurred",
    userMessage: "Something went wrong. Please try again or contact support if the issue persists.",
    shouldRetry: true,
  }
}

export function logAIError(error: AIError, context?: any): void {
  console.error("AI Error:", {
    type: error.type,
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
  })

  // Here you could implement additional logging to a service like Sentry, Datadog, etc.
}
