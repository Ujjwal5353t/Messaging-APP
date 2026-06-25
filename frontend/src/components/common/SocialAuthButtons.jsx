function BaseSocialButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-2xl border bg-background/40 hover:bg-background transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function GoogleAuthButton({ disabled, onClick }) {
  return (
    <BaseSocialButton disabled={disabled} onClick={onClick} label="Continue with Google">
      <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
      <span>Google</span>
    </BaseSocialButton>
  );
}

function AppleAuthButton({ disabled }) {
  return (
    <BaseSocialButton disabled={disabled} label="Continue with Apple">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M16.365 1.43c0 1.14-.415 1.995-1.088 2.784-.748.866-1.97 1.54-3.156 1.443-.145-1.06.34-2.083 1.01-2.83.738-.823 2.04-1.452 3.234-1.397zM20.44 17.138c-.603 1.33-.891 1.923-1.668 3.07-1.082 1.596-2.608 3.585-4.503 3.599-1.682.014-2.115-1.097-4.398-1.085-2.285.012-2.759 1.106-4.44 1.092-1.895-.014-3.34-1.804-4.424-3.4-3.033-4.468-3.349-9.71-1.478-12.58 1.33-2.044 3.425-3.24 5.393-3.24 2.005 0 3.266 1.1 4.921 1.1 1.606 0 2.585-1.103 4.906-1.103 1.753 0 3.612.95 4.94 2.594-4.333 2.377-3.63 8.61.751 10.953z" />
      </svg>
      <span>Apple</span>
    </BaseSocialButton>
  );
}

function XAuthButton({ disabled, onClick }) {
  return (
    <BaseSocialButton disabled={disabled} onClick={onClick} label="Continue with X">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M18.901 1.154h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.636 7.584H.478l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.04L6.487 3.24H4.298z" />
      </svg>
      <span>X</span>
    </BaseSocialButton>
  );
}

export default function SocialAuthButtons({ loading, onGoogleSignIn , onXsignIn }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <GoogleAuthButton disabled={loading} onClick={onGoogleSignIn} />
      <AppleAuthButton disabled={loading} />
      <XAuthButton disabled={loading} onClick={onXsignIn} />
    </div>
  );
}
