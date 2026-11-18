export function FormField({ label, error, register, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className={`rounded border px-3 py-2 text-sm outline-none focus:border-[#6B4226] ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...register}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )
}