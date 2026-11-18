export function Button({ children, isLoading, className = '', ...props }) {
  return (
    <button
      className={`flex items-center justify-center rounded bg-[#6B4226] px-4 py-2 font-medium text-white transition hover:bg-[#55341e] disabled:opacity-50 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}