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
        About DuckType - Free Online Typing Speed Test
      </h1>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>What is DuckType?</h2>
        <p style={{ marginBottom: '12px' }}>
          DuckType is a free, open-source online typing test designed to help you measure and improve your
          typing speed and accuracy. Whether you want to check your WPM (words per minute), practice touch typing,
          or train with daily challenges, DuckType provides a clean, distraction-free environment with no sign-up required.
        </p>
        <p>
          All your progress — test history, personal bests, achievements, and lesson progress — is saved
          locally on your device using your browser's localStorage. Your data never leaves your computer.
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
            tests (15s, 30s, 60s, 120s) or word count tests (10, 25, 50, 100 words). Add punctuation and numbers for extra challenge.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Detailed Results:</strong> After each test, view your
            WPM, raw WPM, accuracy, and consistency. An interactive chart shows your performance over time.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Gamification:</strong> Earn XP, level up through 10 duck ranks
            (from Egg to Duck King), unlock 30 achievements, and maintain daily streaks.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Daily Challenges:</strong> A new typing challenge every day
            with the same words for all users. Compete and maintain your daily streak.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Typing Lessons:</strong> Structured lessons from home row
            to full keyboard, plus weak key analysis that targets your specific problem areas.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Keyboard Heatmap:</strong> Visual analysis of your error
            rate per key, so you know exactly which keys need more practice.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>17+ Themes:</strong> Personalize your experience with
            themes including DuckType Dark, Duck Pond, Dracula, Nord, Tokyo Night, and more.
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
          WPM (Words Per Minute) is the standard measurement of typing speed. DuckType uses the universally accepted formula:
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
            <strong style={{ color: 'var(--text-color)' }}>Raw WPM:</strong> Includes all typed characters, both correct and incorrect.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Accuracy:</strong> The percentage of correct keystrokes out of total keystrokes.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Consistency:</strong> How stable your typing speed is throughout the test, measured as 100 minus the coefficient of variation.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>What is a Good Typing Speed?</h2>
        <p style={{ marginBottom: '12px' }}>
          Typing speed varies by experience. Here are general benchmarks:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
        }}>
          {[
            ['Beginner', '< 30 WPM'],
            ['Average', '40-50 WPM'],
            ['Above Average', '60-75 WPM'],
            ['Fast', '80-100 WPM'],
            ['Professional', '100-130 WPM'],
            ['Expert', '130+ WPM'],
          ].map(([level, speed]) => (
            <div key={level} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: '6px',
              fontSize: '13px',
            }}>
              <span style={{ color: 'var(--text-color)' }}>{level}</span>
              <span style={{ color: 'var(--main-color)', fontWeight: 600 }}>{speed}</span>
            </div>
          ))}
        </div>
        <p>
          Most office workers type around 40 WPM. With regular practice on DuckType, you can reach 80+ WPM within a few months.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>How to Improve Your Typing Speed</h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Focus on accuracy first.</strong> Speed
            will naturally follow once you build muscle memory. Aim for 95%+ accuracy before trying to increase speed.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Use proper finger placement.</strong> Keep
            your fingers on the home row (ASDF JKL;) and reach for other keys without looking. DuckType's lesson mode teaches this step by step.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Practice 10-15 minutes daily.</strong> Short,
            consistent sessions are more effective than occasional long ones. Use the daily challenge feature to stay motivated.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Don't look at the keyboard.</strong> Train
            yourself to type without looking down. Cover your hands if needed.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--text-color)' }}>Target your weak keys.</strong> Use DuckType's
            keyboard heatmap to identify problem keys and practice them with the weak keys lesson.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--main-color)', marginBottom: '12px' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'Is DuckType free?', a: 'Yes, DuckType is 100% free and open source. No account or sign-up needed.' },
            { q: 'Does DuckType store my data on a server?', a: 'No. All data is saved locally in your browser using localStorage. Nothing is sent to any server.' },
            { q: 'What languages are supported?', a: 'English, Korean (한국어), Chinese (中文), and Japanese (日本語) with full IME support.' },
            { q: 'How do I improve my weak keys?', a: 'Go to Practice > Weak Keys. DuckType analyzes your typing data to generate exercises focusing on your most error-prone keys.' },
            { q: 'What are the daily challenges?', a: 'Every day, all DuckType users get the same set of words. Complete it to maintain your daily streak and earn bonus XP.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-color)', marginBottom: '4px' }}>{q}</h3>
              <p style={{ fontSize: '13px', color: 'var(--sub-color)' }}>{a}</p>
            </div>
          ))}
        </div>
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
