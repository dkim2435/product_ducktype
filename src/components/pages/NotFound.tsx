interface NotFoundProps {
  onBack: () => void;
}

export function NotFound({ onBack }: NotFoundProps) {
  return (
    <div className="max-w-[500px] mx-auto px-6 py-20 text-center">
      <div className="text-[64px] mb-4">🦆</div>
      <h1 className="text-main text-[48px] font-bold mb-2">
        404
      </h1>
      <p className="text-sub text-base mb-8 leading-[1.6]">
        This page doesn't exist. The duck couldn't find it either.
      </p>
      <button
        onClick={onBack}
        className="px-8 py-3 bg-main text-bg border-none rounded-default text-[15px] font-semibold cursor-pointer font-[inherit]"
      >
        Go Home
      </button>
    </div>
  );
}
