interface ContactProps {
  onBack: () => void;
}

export function Contact({ onBack }: ContactProps) {
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
      <h1 style={{ color: 'var(--main-color)', fontSize: '28px', marginBottom: '24px' }}>
        Contact Us
      </h1>

      <section style={{ marginBottom: '28px' }}>
        <p style={{ marginBottom: '20px' }}>
          We'd love to hear from you! Whether you have a question, feedback, bug report,
          or just want to say hello, feel free to reach out.
        </p>

        <div style={{
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '16px', color: 'var(--main-color)', marginBottom: '16px' }}>
            Feedback Widget
          </h2>
          <p>
            Click the feedback button at the bottom-right corner of the screen to send us
            your questions, bug reports, or suggestions. No email or sign-up required.
          </p>
          <p style={{ color: 'var(--sub-color)', fontSize: '13px', marginTop: '8px' }}>
            Powered by Userback — your feedback is completely anonymous.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>
          Frequently Asked Questions
        </h2>

        {[
          {
            q: 'Is DuckType free to use?',
            a: 'Yes! DuckType is completely free. We support the service through non-intrusive advertisements.',
          },
          {
            q: 'Do I need to create an account?',
            a: 'No. All your settings and typing history are stored locally in your browser. No registration required.',
          },
          {
            q: 'Which browsers are supported?',
            a: 'DuckType works best on modern browsers like Chrome, Firefox, Edge, and Safari. For CJK (Korean, Chinese, Japanese) input, we recommend Chrome or Edge for the best IME support.',
          },
          {
            q: 'How is my data stored?',
            a: 'All data is stored in your browser\'s localStorage. Nothing is sent to any server. Clearing your browser data will reset your settings and history.',
          },
          {
            q: 'Can I use DuckType on mobile?',
            a: 'DuckType is optimized for desktop use with a physical keyboard. Mobile support is limited as typing tests require a full keyboard for accurate measurements.',
          },
        ].map(({ q, a }) => (
          <div key={q} style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--text-color)', marginBottom: '6px' }}>{q}</h3>
            <p style={{ color: 'var(--sub-color)', fontSize: '14px' }}>{a}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
