interface ContactProps {
  onBack: () => void;
}

export function Contact({ onBack }: ContactProps) {
  return (
    <article className="max-w-[700px] mx-auto px-6 py-10 text-text leading-[1.8] text-[15px]">
      <button onClick={onBack} className="mb-6 text-sm">
        &larr; Back
      </button>
      <h1 className="text-main text-[28px] mb-6">
        Contact Us
      </h1>

      <section className="mb-7">
        <p className="mb-5">
          We'd love to hear from you! Whether you have a question, feedback, bug report,
          or just want to say hello, feel free to reach out.
        </p>

        <div className="bg-sub-alt rounded-[12px] p-6 mb-6">
          <h2 className="text-base text-main mb-4">
            Feedback Widget
          </h2>
          <p>
            Click the feedback button at the bottom-right corner of the screen to send us
            your questions, bug reports, or suggestions. No email or sign-up required.
          </p>
          <p className="text-sub text-[13px] mt-2">
            Powered by Userback — your feedback is completely anonymous.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg text-main mb-3">
          Frequently Asked Questions
        </h2>

        {[
          {
            q: 'Is DuckType free to use?',
            a: 'Yes! DuckType is completely free. We support the service through non-intrusive advertisements.',
          },
          {
            q: 'Do I need to create an account?',
            a: 'No, but creating a free account lets you save your progress and sync it across devices.',
          },
          {
            q: 'Which browsers are supported?',
            a: 'DuckType works best on modern browsers like Chrome, Firefox, Edge, and Safari. For CJK (Korean, Chinese, Japanese) input, we recommend Chrome or Edge for the best IME support.',
          },
          {
            q: 'How is my data stored?',
            a: 'Settings (theme, language) are stored locally in your browser. If you have an account, your progress is securely synced to the cloud.',
          },
          {
            q: 'Can I use DuckType on mobile?',
            a: 'DuckType is optimized for desktop use with a physical keyboard. Mobile support is limited as typing tests require a full keyboard for accurate measurements.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="mb-5">
            <h3 className="text-[15px] text-text mb-[6px]">{q}</h3>
            <p className="text-sub text-sm">{a}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
