interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
  return (
    <article className="max-w-[700px] mx-auto px-6 py-10 text-text leading-[1.8] text-[15px]">
      <button onClick={onBack} className="mb-6 text-sm">
        &larr; Back
      </button>
      <h1 className="text-main text-[28px] mb-6">
        About DuckType - Free Online Typing Speed Test
      </h1>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">What is DuckType?</h2>
        <p className="mb-3">
          DuckType is a free, open-source online typing test designed to help you measure and improve your
          typing speed and accuracy. Whether you want to check your WPM (words per minute), practice touch typing,
          or train with daily challenges, DuckType provides a clean, distraction-free environment with no sign-up required.
        </p>
        <p>
          When you create a free account, your progress — test history, personal bests, achievements, and
          lesson progress — is securely synced to the cloud so you can pick up where you left off on any device.
        </p>
      </section>

      <section className="mb-7 p-5 bg-sub-alt rounded-[12px] border-[1.5px] border-main">
        <h2 className="text-xl text-main mb-3">
          ⚔️ Adventure Mode — Typing RPG
        </h2>
        <p className="mb-3">
          DuckType isn't just a typing test — it's a <strong className="text-main">typing RPG</strong>.
          Battle monsters, defeat epic bosses, and conquer worlds by typing fast and accurately.
          Each world has unique enemies, debuffs, and a final boss with cinematic death animations.
        </p>
        <ul className="pl-5 mb-3">
          <li className="mb-[6px]"><strong className="text-text">World 1: Duck Village</strong> — 8 stages + Shadow Wolf boss. Defend your home!</li>
          <li className="mb-[6px]"><strong className="text-text">World 2: Venom Jungle</strong> — 9 stages + Giant Viper boss. Survive the poison!</li>
          <li className="mb-[6px]"><strong className="text-text">3 Difficulty Tiers</strong> — Beginner, Intermediate, Expert. Beat the boss to unlock the next tier.</li>
          <li className="mb-[6px]"><strong className="text-text">More worlds coming soon</strong> — Fog, freeze, darkness, and more debuffs await.</li>
        </ul>
        <p className="text-[13px] text-sub">
          Free to start. No account needed for World 1. Login to unlock World 2+ and sync progress across devices.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">Features</h2>
        <ul className="pl-5">
          <li className="mb-[10px]">
            <strong className="text-text">Multiple Languages:</strong> Practice typing in
            English, Korean, Chinese, and Japanese with native word lists and full IME support.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Flexible Test Modes:</strong> Choose between timed
            tests (15s, 30s, 60s, 120s) or word count tests (10, 25, 50, 100 words). Add punctuation and numbers for extra challenge.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Detailed Results:</strong> After each test, view your
            WPM, raw WPM, accuracy, and consistency. An interactive chart shows your performance over time.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Gamification:</strong> Earn XP, level up through 10 duck ranks
            (from Egg to Duck King), unlock 30 achievements, and maintain daily streaks.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Daily Challenges:</strong> A new typing challenge every day
            with the same words for all users. Compete and maintain your daily streak.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Typing Lessons:</strong> Structured lessons from home row
            to full keyboard, plus weak key analysis that targets your specific problem areas.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Keyboard Heatmap:</strong> Visual analysis of your error
            rate per key, so you know exactly which keys need more practice.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">17+ Themes:</strong> Personalize your experience with
            themes including DuckType Dark, Duck Pond, Dracula, Nord, Tokyo Night, and more.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Share Results:</strong> Generate and share a
            beautiful result image with your WPM score and statistics.
          </li>
        </ul>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">How WPM is Calculated</h2>
        <p className="mb-3">
          WPM (Words Per Minute) is the standard measurement of typing speed. DuckType uses the universally accepted formula:
        </p>
        <div className="bg-sub-alt px-5 py-4 rounded-[8px] mb-3 font-mono text-sm text-main">
          WPM = (correct characters / 5) / (elapsed time in minutes)
        </div>
        <p className="mb-3">
          Each "word" is standardized to 5 characters, including spaces. This ensures fair
          comparison across different languages and word lengths.
        </p>
        <ul className="pl-5">
          <li className="mb-2">
            <strong className="text-text">Raw WPM:</strong> Includes all typed characters, both correct and incorrect.
          </li>
          <li className="mb-2">
            <strong className="text-text">Accuracy:</strong> The percentage of correct keystrokes out of total keystrokes.
          </li>
          <li className="mb-2">
            <strong className="text-text">Consistency:</strong> How stable your typing speed is throughout the test, measured as 100 minus the coefficient of variation.
          </li>
        </ul>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">What is a Good Typing Speed?</h2>
        <p className="mb-3">
          Typing speed varies by experience. Here are general benchmarks:
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            ['Beginner', '< 30 WPM'],
            ['Average', '40-50 WPM'],
            ['Above Average', '60-75 WPM'],
            ['Fast', '80-100 WPM'],
            ['Professional', '100-130 WPM'],
            ['Expert', '130+ WPM'],
          ].map(([level, speed]) => (
            <div key={level} className="flex justify-between px-3 py-2 bg-sub-alt rounded-[6px] text-[13px]">
              <span className="text-text">{level}</span>
              <span className="text-main font-semibold">{speed}</span>
            </div>
          ))}
        </div>
        <p>
          Most office workers type around 40 WPM. With regular practice on DuckType, you can reach 80+ WPM within a few months.
        </p>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">How to Improve Your Typing Speed</h2>
        <ol className="pl-5">
          <li className="mb-[10px]">
            <strong className="text-text">Focus on accuracy first.</strong> Speed
            will naturally follow once you build muscle memory. Aim for 95%+ accuracy before trying to increase speed.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Use proper finger placement.</strong> Keep
            your fingers on the home row (ASDF JKL;) and reach for other keys without looking. DuckType's lesson mode teaches this step by step.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Practice 10-15 minutes daily.</strong> Short,
            consistent sessions are more effective than occasional long ones. Use the daily challenge feature to stay motivated.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Don't look at the keyboard.</strong> Train
            yourself to type without looking down. Cover your hands if needed.
          </li>
          <li className="mb-[10px]">
            <strong className="text-text">Target your weak keys.</strong> Use DuckType's
            keyboard heatmap to identify problem keys and practice them with the weak keys lesson.
          </li>
        </ol>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {[
            { q: 'Is DuckType free?', a: 'Yes, DuckType is 100% free and open source. No account or sign-up needed.' },
            { q: 'Does DuckType store my data on a server?', a: 'If you create an account, your progress is securely synced to the cloud. Settings like theme and language are always saved locally in your browser.' },
            { q: 'What languages are supported?', a: 'English, Korean (한국어), Chinese (中文), and Japanese (日本語) with full IME support.' },
            { q: 'How do I improve my weak keys?', a: 'Go to Practice > Weak Keys. DuckType analyzes your typing data to generate exercises focusing on your most error-prone keys.' },
            { q: 'What are the daily challenges?', a: 'Every day, all DuckType users get the same set of words. Complete it to maintain your daily streak and earn bonus XP.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-sm text-text mb-1">{q}</h3>
              <p className="text-[13px] text-sub">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-lg text-main mb-3">Keyboard Shortcuts</h2>
        <div className="flex flex-col gap-2">
          {[
            ['Tab + Enter', 'Restart the test with new words'],
            ['Escape', 'Restart the test'],
            ['Ctrl + Backspace', 'Delete entire current word'],
          ].map(([key, desc]) => (
            <div key={key} className="flex gap-4 items-center">
              <code className="bg-sub-alt px-[10px] py-1 rounded-[4px] text-[13px] text-main min-w-[160px]">{key}</code>
              <span className="text-sub text-sm">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg text-main mb-3">Contact</h2>
        <p>
          Have feedback or suggestions? Use the feedback widget at the bottom-right corner
          of the screen to send us a message anytime.
        </p>
      </section>
    </article>
  );
}
