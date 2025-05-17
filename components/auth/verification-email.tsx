import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components"

interface VerificationEmailProps {
  verificationUrl: string
  username: string
}

export const VerificationEmail = ({ verificationUrl, username }: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Vérification de votre adresse email</Heading>
          <Text style={text}>Bonjour {username},</Text>
          <Text style={text}>
            Merci de vous être inscrit. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur
            le bouton ci-dessous.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Vérifier mon email
            </Button>
          </Section>
          <Text style={text}>Si vous n&apos;avez pas créé de compte, vous pouvez ignorer cet email.</Text>
          <Text style={text}>Ce lien expirera dans 24 heures.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur:{" "}
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  padding: "20px 0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20, 50, 70, 0.2)",
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: "600px",
  padding: "20px",
}

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 15px",
}

const text = {
  color: "#444",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "15px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1.4",
  padding: "12px 24px",
  textDecoration: "none",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
}

const footer = {
  color: "#777",
  fontSize: "12px",
  lineHeight: "1.5",
}

const link = {
  color: "#444",
  textDecoration: "underline",
}

export default VerificationEmail
