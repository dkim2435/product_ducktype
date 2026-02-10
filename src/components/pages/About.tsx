interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
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
        About DuckType
      </h1>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>What is DuckType?</h2>
        <p>
          DuckType is a free, open-source typing test designed to help you measure and improve your
          typing speed and accuracy. Whether you're a beginner learning to touch type or a seasoned
          typist aiming for higher WPM, DuckType provides a clean, distraction-free environment to
          practice.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>Features</h2>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Multiple Languages:</strong> Practice typing in
            English, Korean, Chinese, and Japanese with native word lists and full IME support.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Flexible Test Modes:</strong> Choose between timed
            tests (15s, 30s, 60s, 120s) or word count tests (10, 25, 50, 100 words). Add
            punctuation and numbers for extra challenge.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Detailed Results:</strong> After each test, view your
            WPM, raw WPM, accuracy, and consistency. An interactive chart shows your performance
            over time.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>17+ Themes:</strong> Personalize your experience with
            beautiful themes including DuckType Dark, Duck Pond, Rubber Duck, Dracula, Nord,
            Tokyo Night, and many more.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Local Progress Tracking:</strong> Your test history
            and personal bests are saved locally on your device. No account required.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Share Results:</strong> Generate and share a
            beautiful result image with your WPM score and statistics.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>How WPM is Calculated</h2>
        <p style={{ marginBottom: '12px' }}>
          WPM (Words Per Minute) is the standard measurement of typing speed. In DuckType, we use
          the standard formula:
        </p>
        <div style={{
          backgroundColor: 'var(--sub-alt-color)',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'var(--main-color)',
        }}>
          WPM = (correct characters / 5) / (elapsed time in minutes)
        </div>
        <p style={{ marginBottom: '12px' }}>
          Each "word" is standardized to 5 characters, including spaces. This ensures fair
          comparison across different languages and word lengths.
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Raw WPM:</strong> Includes all typed characters,
            both correct and incorrect.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Accuracy:</strong> The percentage of correct
            keystrokes out of total keystrokes.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Consistency:</strong> How stable your typing speed
            is throughout the test, measured as 100 minus the coefficient of variation.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>Tips to Improve Your Typing</h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Focus on accuracy first.</strong> Speed
            will naturally follow once you build muscle memory. Aim for 95%+ accuracy before
            trying to increase speed.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Use proper finger placement.</strong> Keep
            your fingers on the home row (ASDF JKL;) and reach for other keys without looking.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Practice regularly.</strong> Short,
            consistent practice sessions (10-15 minutes daily) are more effective than occasional
            long sessions.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Don't look at the keyboard.</strong> Train
            yourself to type without looking down. Cover your hands if needed.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Use all your fingers.</strong> Avoid the
            temptation to type with just a few fingers. Each finger has assigned keys.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>Keyboard Shortcuts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['Tab + Enter', 'Restart the test with new words'],
            ['Escape', 'Restart the test'],
            ['Ctrl + Backspace', 'Delete entire current word'],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <code style={{
                backgroundColor: 'var(--sub-alt-color)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '13px',
                color: 'var(--main-color)',
                minWidth: '160px',
              }}>{key}</code>
              <span style={{ color: 'var(--sub-color)', fontSize: '14px' }}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>Contact</h2>
        <p>
          Have feedback or suggestions? Reach out to us
          at <span style={{ color: 'var(--main-color)' }}>ducktype.contact@gmail.com</span>.
        </p>
      </section>
    </article>
  );
}
