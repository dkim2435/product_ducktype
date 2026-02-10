interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <article style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '40px 24px',
      color: 'var(--text-color)',
      lineHeight: 1.8,
      fontSize: '15px',
    }}>
      <button onClick={onBack} style={{ marginBottom: '24px', fontSize: '14px' }}>
        &larr; Back
      </button>
      <h1 style={{ color: 'var(--main-color)', fontSize: '28px', marginBottom: '8px' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--sub-color)', marginBottom: '32px', fontSize: '13px' }}>
        Last updated: February 2026
      </p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
        <p>
          By accessing and using DuckType ("the Service"), you agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>2. Description of Service</h2>
        <p>
          DuckType is a free online typing test tool that allows users to measure and improve their
          typing speed and accuracy. The Service supports multiple languages including English,
          Korean, Chinese, and Japanese. The Service is provided "as is" without any guarantees.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>3. User Conduct</h2>
        <p style={{ marginBottom: '12px' }}>When using the Service, you agree not to:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Attempt to disrupt or interfere with the Service's functionality</li>
          <li style={{ marginBottom: '8px' }}>Use automated tools or bots to interact with the Service</li>
          <li style={{ marginBottom: '8px' }}>Attempt to bypass any security features of the Service</li>
          <li style={{ marginBottom: '8px' }}>Use the Service for any unlawful purpose</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>4. Intellectual Property</h2>
        <p>
          The DuckType name, logo, and all associated visual design elements are the property of
          DuckType. The Service's source code, design, and content are protected by copyright and
          other intellectual property laws.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>5. Advertisements</h2>
        <p>
          The Service may display advertisements provided by third-party advertising networks,
          including Google AdSense. These advertisements help us keep the Service free for all users.
          Ad content is managed by the respective advertising networks and is not endorsed by DuckType.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>6. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an "as is" and "as available" basis. We make no warranties,
          expressed or implied, regarding the Service's reliability, accuracy, or availability.
          Typing speed results are for personal reference only and should not be used as official
          measurements.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>7. Limitation of Liability</h2>
        <p>
          DuckType shall not be liable for any indirect, incidental, special, or consequential
          damages arising out of or in connection with your use of the Service.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the Service after
          changes constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>9. Contact</h2>
        <p>
          For questions about these Terms, please use the feedback widget at the
          bottom-right corner of the screen to contact us.
        </p>
      </section>
    </article>
  );
}
