import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface ResetPasswordEmailProps {
  resetUrl: string
  username: string
}

export const ResetPasswordEmail = ({ resetUrl, username }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Réinitialisation de mot de passe</Heading>
          <Text style={paragraph}>Bonjour {username},</Text>
          <Text style={paragraph}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Si vous n'êtes pas à
            l'origine de cette demande, vous pouvez ignorer cet email.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>
          <Text style={paragraph}>Ou copiez et collez ce lien dans votre navigateur:</Text>
          <Text style={link}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Ce lien expirera dans 1 heure. Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez
            ignorer cet email ou nous contacter si vous avez des questions.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles pour l'email
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  padding: "20px 0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: "5px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "20px",
}

const heading = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
}

const paragraph = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#000000",
  borderRadius: "4px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
}

const link = {
  color: "#0066cc",
  fontSize: "16px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
}

const hr = {
  borderColor: "#e6e6e6",
  margin: "30px 0",
}

const footer = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "22px",
}
