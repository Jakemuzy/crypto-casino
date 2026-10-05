'use client';

type Props = {
  onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
  return (
    <form action={onSignIn}>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#C9A45C] px-3 py-2.5 text-sm font-semibold text-[#0B1F1A] transition-colors hover:bg-[#D8B56D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C]"
      >
        Sign in
      </button>
    </form>
  );
};

export default SignIn;
