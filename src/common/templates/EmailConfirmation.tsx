import { Container, Text, Html } from '@react-email/components'

interface IProps {
    code: string;
}

interface IProps {
    code: string;
    firstName: string;
}

export default function EmailConfirmation({ code, firstName }: IProps) {
    return (
        <Html>
            <Container style={styles.container}>
                <Text style={styles.heading}>Welcome {firstName}!</Text>
                <Text style={styles.paragraph}>
                    Thank you for signing up. To complete your registration, please use the verification code below:
                </Text>
                <Text style={styles.code}>{code}</Text>
                <Text style={styles.footer}>
                    If you didn't request this email, you can safely ignore it.
                </Text>
            </Container>
        </Html>
    );
}

const styles = {
    container: {
        padding: '40px 20px',
        background: '#ffffff',
        borderRadius: '5px',
        maxWidth: '600px',
        margin: '0 auto',
    },
    heading: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        color: '#1a73e8',
        marginBottom: '20px',
    },
    paragraph: {
        fontSize: '16px',
        lineHeight: '24px',
        color: '#333333',
        marginBottom: '20px',
        textAlign: 'center' as const,
    },
    code: {
        fontSize: '32px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        color: '#1a73e8',
        padding: '20px',
        margin: '20px 0',
        background: '#f0f7ff',
        borderRadius: '5px',
    },
    footer: {
        fontSize: '14px',
        color: '#666666',
        textAlign: 'center' as const,
        marginTop: '30px',
    },
};
